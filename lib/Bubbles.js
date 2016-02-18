var canvas;
var	camera, scene, renderer;
var cameraOrtho, sceneOrtho;
var raycaster, intersect = null;
var data;

var lat = 0, lon = 0;

var isUserInteracting = false;
var animate = false;
var mouseDownX, mouseX;
var mouseDownY, mouseY;

var fovInit, fovMax, fovMin;

var spritesArray = [], hotspotsArray = [];

var loadingManager = new THREE.LoadingManager();
var textureLoader = new THREE.TextureLoader(loadingManager);




loadingManager.onProgress = function (item, loaded, total) 
{
	console.log(item, loaded, total);
}

loadingManager.onError = function (item)
{
	console.log(item, "loading error!");
}

function Bubbles(container, url) 
{
	canvas = document.getElementById(container);
	
	var loader = new THREE.XHRLoader(loadingManager);
	loader.setResponseType("json");
	try {
		loader.load(url, function(text){
			data = text;
			initData();
		});
	} 
	catch (err) {
		console.log("json loader error");
	}	
}

function initData()
{
	fovInit = data.bubbles[0].view.fov.init !== undefined ? data.bubbles[0].view.fov.init : 75;
	fovMax = data.bubbles[0].view.fov.max !== undefined ? data.bubbles[0].view.fov.max : 85;
	fovMin = data.bubbles[0].view.fov.min !== undefined ? data.bubbles[0].view.fov.min : 35;

	initScene();
}

function initScene() 
{
	scene = new THREE.Scene();
	sceneOrtho = new THREE.Scene();

	raycaster = new THREE.Raycaster();

	camera = new THREE.PerspectiveCamera(fovInit, canvas.offsetWidth/canvas.offsetHeight, 0.1, 1000);
	camera.target = new THREE.Vector3(1, 0, 0);
	camera.lookAt(camera.target);

	cameraOrtho = new THREE.OrthographicCamera( -canvas.offsetWidth/2, canvas.offsetWidth/2, canvas.offsetHeight/2, -canvas.offsetHeight/2, 0, 100);
	cameraOrtho.position.z = 10;


	renderer = new THREE.WebGLRenderer();
	renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
	renderer.autoClear = false;
	canvas.appendChild(renderer.domElement);

	var geometry = new THREE.BoxGeometry(500, 500, 500);
	geometry.scale(-1, 1, 1);

	var textures = [];
	var tex;
	tex = textureLoader.load(data.bubbles[0].image.data.back, render);
	tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
	textures.push(new THREE.MeshBasicMaterial({map: tex}));
	tex = textureLoader.load(data.bubbles[0].image.data.front, render);
	tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
	textures.push(new THREE.MeshBasicMaterial({map: tex}));
	tex = textureLoader.load(data.bubbles[0].image.data.up, render);
	tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
	textures.push(new THREE.MeshBasicMaterial({map: tex}));
	tex = textureLoader.load(data.bubbles[0].image.data.down, render);
	tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
	textures.push(new THREE.MeshBasicMaterial({map: tex}));
	tex = textureLoader.load(data.bubbles[0].image.data.right, render);
	tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
	textures.push(new THREE.MeshBasicMaterial({map: tex}));
	tex = textureLoader.load(data.bubbles[0].image.data.left, render);
	tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
	textures.push(new THREE.MeshBasicMaterial({map: tex}));

	var material = new THREE.MultiMaterial(textures);

	var cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	loadSprites(data.sprites);
	loadHotspots();

	render();

	window.addEventListener('resize', onWindowResize);
	document.addEventListener('mousedown', onMouseDown);
	document.addEventListener('mouseup', onMouseUp);
	document.addEventListener('mouseout', onMouseUp);
	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mousewheel', onMouseWheel);
	document.addEventListener('DOMMouseScroll', onMouseWheel);
}

function loadHotspots()
{
	var hotspots = data.bubbles[0].hotspots;
	for (var key in hotspots) {
		var geometry = new THREE.PlaneGeometry(1,1);
		var distorted = hotspots[key].distorted === true ? true : false;

		var tex;
		tex = textureLoader.load(hotspots[key].url, updateHotspots);
		tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;

		var hotspot, material;
		if (distorted) {
			material = new THREE.MeshBasicMaterial({map: tex, transparent: true});
			hotspot = new THREE.Mesh(geometry, material);
		} else {
			material = new THREE.SpriteMaterial({map: tex});
			hotspot = new THREE.Sprite(material);
		}

		hotspot.data = [];
		hotspot.data.zorder = hotspots[key].zorder !== undefined ? hotspots[key].zorder : 0;

		var spotlat = hotspots[key].lat !== undefined ? hotspots[key].lat : 0;
		var spotlon = hotspots[key].lon !== undefined ? hotspots[key].lon : 0;

		var phi = THREE.Math.degToRad(90-spotlat);
		var theta = THREE.Math.degToRad(spotlon);
		
		var position = new THREE.Vector3(0, 0, 0);
		position.x = 100* Math.sin(phi) * Math.cos(theta);
		position.y = 100* Math.cos(phi);
		position.z = 100* Math.sin(phi) * Math.sin(theta);

		hotspot.position.set(position.x, position.y, position.z);
		hotspot.rotation.order = 'YXZ';
		hotspot.rotation.y = -THREE.Math.degToRad(spotlon+90);
		hotspot.rotation.x = THREE.Math.degToRad(spotlat);
		//hotspot.material.opacity = 0.5;

		scene.add(hotspot);
		hotspotsArray.push(hotspot);
	}
}

function updateHotspots(hotspots)
{
	for (var key in hotspotsArray) {
		var hotspot = hotspotsArray[key];
		if (hotspot.material.map.image !== undefined) {
			var imageWidth = hotspot.material.map.image.width;
			var imageHeight = hotspot.material.map.image.height;
			hotspot.scale.x = imageWidth *0.2;
			hotspot.scale.y = imageHeight *0.2;
		}
	}
	render();
}

function loadSprites(sprites)
{
	for (var key in sprites) {
		var tex = textureLoader.load(sprites[key].url, updateSprites);
		tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
		var spriteMaterial = new THREE.SpriteMaterial({map: tex});
		var sprite = new THREE.Sprite(spriteMaterial);
		sprite.data = [];

		sprite.data.x = sprites[key].position.x !== undefined ? sprites[key].position.x : 0;
		sprite.data.y = sprites[key].position.y !== undefined ? sprites[key].position.y : 0;
		sprite.data.zorder = sprites[key].zorder !== undefined ? sprites[key].zorder : 0;
		sprite.data.align = sprites[key].align;

		sprite.position.set(sprite.data.x, sprite.data.y, sprite.data.zorder);
		sceneOrtho.add(sprite);
		spritesArray.push(sprite);
	}
}

function updateSprites()
{
	for (var key in spritesArray) {
		var sprite = spritesArray[key];
		if (sprite.material.map.image !== undefined) {
			var imageWidth = sprite.material.map.image.width;
			var imageHeight = sprite.material.map.image.height;
			sprite.scale.set(imageWidth, imageHeight, 1);
			
			if (sprite.data.align !== undefined) {
				switch (sprite.data.align) {
					case 'left':
						sprite.position.set(-canvas.offsetWidth/2+imageWidth/2+sprite.data.x, sprite.position.y, sprite.position.z);
						break;
					case 'right':
						sprite.position.set(canvas.offsetWidth/2-imageWidth/2-sprite.data.x, sprite.position.y, sprite.position.z);
						break;
					case 'top':
						sprite.position.set(sprite.position.x, canvas.offsetHeight/2-imageHeight/2-sprite.data.y, sprite.position.z);
						break;
					case 'bottom':
						sprite.position.set(sprite.position.x, -canvas.offsetHeight/2+imageHeight/2+sprite.data.y, sprite.position.z);
						break;
					case 'lefttop':
					case 'topleft':
						sprite.position.set(-canvas.offsetWidth/2+imageWidth/2+sprite.data.x, canvas.offsetHeight/2-imageHeight/2-sprite.data.y, sprite.position.z);
						break;
					case 'leftbottom':
					case 'bottomleft':
						sprite.position.set(-canvas.offsetWidth/2+imageWidth/2+sprite.data.x, -canvas.offsetHeight/2+imageHeight/2+sprite.data.y, sprite.position.z);
						break;
					case 'righttop':
					case 'topright':
						sprite.position.set(canvas.offsetWidth/2-imageWidth/2-sprite.data.x, canvas.offsetHeight/2-imageHeight/2-sprite.data.y, sprite.position.z);
						break;
					case 'rightbottom':
					case 'bottomright':
						sprite.position.set(canvas.offsetWidth/2-imageWidth/2-sprite.data.x, -canvas.offsetHeight/2+imageHeight/2+sprite.data.y, sprite.position.z);
						break;
				}
			}
		}
		render();
	}
}

function render()
{
	renderer.clear();
	renderer.render(scene, camera);
	renderer.clearDepth();
	renderer.render(sceneOrtho, cameraOrtho);
}

function onWindowResize() 
{
	camera.aspect = canvas.offsetWidth/canvas.offsetHeight;
	camera.updateProjectionMatrix();

	cameraOrtho.left = -canvas.offsetWidth/2;
	cameraOrtho.right = canvas.offsetWidth/2;
	cameraOrtho.top = canvas.offsetHeight/2;
	cameraOrtho.bottom = -canvas.offsetHeight/2;
	cameraOrtho.updateProjectionMatrix();

	renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
	updateSprites();
	render();
}

function onMouseDown(event)
{
	isUserInteracting = true;
	
	mouseDownX = event.clientX;
	mouseDownY = event.clientY;

	console.log(intersect);
}

function onMouseUp()
{
	isUserInteracting = false;
	animate = false;
}

function onMouseMove(event)
{
	var mouse = new THREE.Vector2();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera(mouse, cameraOrtho);
	intersect = raycaster.intersectObjects(sceneOrtho.children);
	if (intersect.length>0) {
		intersect = intersect[0];
	} else {
		raycaster.setFromCamera(mouse, camera);
		intersect = raycaster.intersectObjects(scene.children);
		if (intersect.length>1) {
			intersect = intersect[0];
		} else {
			intersect = null;
		}
	}


	if (isUserInteracting === true) {
		mouseX = event.clientX;
		mouseY = event.clientY;
		if (animate === false) {
			animate = true;
			animateLookAt();
		}
	}
}

function animateLookAt()
{
	if (isUserInteracting === true) {
		requestAnimationFrame(animateLookAt);

		lon += (mouseX-mouseDownX)*0.00015*camera.fov;
		lat -= (mouseY-mouseDownY)*0.00015*camera.fov;
		
		lat = Math.max(-85, Math.min(85, lat));
		phi = THREE.Math.degToRad(90-lat);
		theta = THREE.Math.degToRad(lon);

		camera.target.x = Math.sin(phi) * Math.cos(theta);
		camera.target.y = Math.cos(phi);
		camera.target.z = Math.sin(phi) * Math.sin(theta);

		camera.lookAt(camera.target);

		render();
	}
}

function onMouseWheel(event)
{
	// WebKit
	if (event.wheelDeltaY) {
		camera.fov -= event.wheelDeltaY * 0.05;
	// Opera / Explorer 9
	} else if (event.wheelDelta) {
		camera.fov -= event.wheelDelta * 0.05;
	// Firefox
	} else if (event.detail) {
		camera.fov += event.detail * 1.0;
	}
	camera.fov = Math.max(fovMin, Math.min(fovMax, camera.fov));
	camera.updateProjectionMatrix();
	render();
}