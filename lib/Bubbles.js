var canvas;
var	camera, scene, renderer;
var cameraOrtho, sceneOrtho;
var raycaster, intersect, lastintersect = null;
var data;

var objectMap = new Map();

var lat = 0, lon = 0;

var isUserInteracting = false;
var animate = false;
var mouseDownX, mouseX;
var mouseDownY, mouseY;

var fovInit, fovMax, fovMin;

var spritesArray = [], hotspotsArray = [];

var loadingManager = new THREE.LoadingManager();
var textureLoader = new THREE.TextureLoader(loadingManager);

var currentBubble = null;




loadingManager.onProgress = function (item, loaded, total) 
{
	console.log(item, loaded, total);
}

loadingManager.onError = function (item)
{
	console.log(item, "error: loading error!");
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
		console.log("error: json loader");
	}	
}

function initData()
{
	if (data.start !== undefined) {
		currentBubble = data.bubbles[data.start];
	} else {
		console.log("error: start not defined");
	}
	
	fovInit = currentBubble.view !== undefined && currentBubble.view.fov !== undefined && currentBubble.view.fov.init !== undefined ? currentBubble.view.fov.init : 75;
	fovMax = currentBubble.view !== undefined && currentBubble.view.fov !== undefined && currentBubble.view.fov.max !== undefined ? currentBubble.view.fov.max : 85;
	fovMin = currentBubble.view !== undefined && currentBubble.view.fov !== undefined && currentBubble.view.fov.min !== undefined ? currentBubble.view.fov.min : 35;

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

	

	var cube = new THREE.Mesh(geometry, returnSkyBoxMaterial());
	scene.add(cube);

	loadSprites(data.sprites);
	loadHotspots();

	render();

	window.addEventListener('resize', onWindowResize);
	document.addEventListener('mousedown', onMouseDown);
	document.addEventListener('mouseup', onMouseUp);
	document.addEventListener('click', onMouseClick);
	document.addEventListener('mouseout', onMouseUp);
	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mousewheel', onMouseWheel);
	document.addEventListener('DOMMouseScroll', onMouseWheel);
}

function returnSkyBoxMaterial()
{
	var textures = [];
	var tex;
	tex = textureLoader.load(currentBubble.image.data.back, render);
	tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
	textures.push(new THREE.MeshBasicMaterial({map: tex}));
	tex = textureLoader.load(currentBubble.image.data.front, render);
	tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
	textures.push(new THREE.MeshBasicMaterial({map: tex}));
	tex = textureLoader.load(currentBubble.image.data.up, render);
	tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
	textures.push(new THREE.MeshBasicMaterial({map: tex}));
	tex = textureLoader.load(currentBubble.image.data.down, render);
	tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
	textures.push(new THREE.MeshBasicMaterial({map: tex}));
	tex = textureLoader.load(currentBubble.image.data.right, render);
	tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
	textures.push(new THREE.MeshBasicMaterial({map: tex}));
	tex = textureLoader.load(currentBubble.image.data.left, render);
	tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
	textures.push(new THREE.MeshBasicMaterial({map: tex}));

	return new THREE.MultiMaterial(textures);
}

function loadHotspots()
{
	var hotspots = currentBubble.hotspots;
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

		hotspot.userData = hotspots[key];
		hotspot.name = key;

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

		console.log(hotspot);
		scene.add(hotspot);
		objectMap.set(key, hotspot);
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
			hotspotsArray.splice(key,1);
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
		
		sprite.userData = sprites[key];
		sprite.name = key;
		if (sprite.userData.position.x == undefined) { sprite.userData.position.x = 0; }
		if (sprite.userData.position.y == undefined) { sprite.userData.position.y = 0; }
		if (sprite.userData.position.zorder == undefined) { sprite.userData.position.zorder = 0; }

		sprite.position.set(sprite.userData.position.x, sprite.userData.position.y, sprite.userData.position.zorder);
		sceneOrtho.add(sprite);
		objectMap.set(key, sprite);
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
			
			if (sprite.userData.align !== undefined) {
				switch (sprite.userData.align) {
					case 'left':
						sprite.position.set(-canvas.offsetWidth/2+imageWidth/2+sprite.userData.position.x, sprite.position.y, sprite.position.z);
						break;
					case 'right':
						sprite.position.set(canvas.offsetWidth/2-imageWidth/2-sprite.userData.position.x, sprite.position.y, sprite.position.z);
						break;
					case 'top':
						sprite.position.set(sprite.position.x, canvas.offsetHeight/2-imageHeight/2-sprite.userData.position.y, sprite.position.z);
						break;
					case 'bottom':
						sprite.position.set(sprite.position.x, -canvas.offsetHeight/2+imageHeight/2+sprite.userData.position.y, sprite.position.z);
						break;
					case 'lefttop':
					case 'topleft':
						sprite.position.set(-canvas.offsetWidth/2+imageWidth/2+sprite.userData.position.x, canvas.offsetHeight/2-imageHeight/2-sprite.userData.position.y, sprite.position.z);
						break;
					case 'leftbottom':
					case 'bottomleft':
						sprite.position.set(-canvas.offsetWidth/2+imageWidth/2+sprite.userData.position.x, -canvas.offsetHeight/2+imageHeight/2+sprite.userData.position.y, sprite.position.z);
						break;
					case 'righttop':
					case 'topright':
						sprite.position.set(canvas.offsetWidth/2-imageWidth/2-sprite.userData.position.x, canvas.offsetHeight/2-imageHeight/2-sprite.userData.position.y, sprite.position.z);
						break;
					case 'rightbottom':
					case 'bottomright':
						sprite.position.set(canvas.offsetWidth/2-imageWidth/2-sprite.userData.position.x, -canvas.offsetHeight/2+imageHeight/2+sprite.userData.position.y, sprite.position.z);
						break;
				}
			}
			spritesArray.splice(key,1);
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
}

function onMouseUp()
{
	isUserInteracting = false;
	animate = false;
}

function onMouseClick()
{
	if (intersect != null) {
		if (intersect.userData.events !== undefined && intersect.userData.events.onclick !== undefined) {
			for (var key in intersect.userData.events.onclick) {
				actionTrigger(intersect.userData.events.onclick[key]);
			}
		}
		render();
	}
}

function onMouseMove(event)
{
	var mouse = new THREE.Vector2();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera(mouse, cameraOrtho);
	intersect = raycaster.intersectObjects(sceneOrtho.children);
	if (intersect.length>0) {
		intersect = intersect[0].object;
	} else {
		raycaster.setFromCamera(mouse, camera);
		intersect = raycaster.intersectObjects(scene.children);
		if (intersect.length>1) {
			intersect = intersect[0].object;
		} else {
			intersect = null;
		}
	}

	if (intersect !== lastintersect){
		if (intersect != null){
			//over
			if (intersect.userData.events !== undefined && intersect.userData.events.onover !== undefined) {
				for (var key in intersect.userData.events.onover) {
					actionTrigger(intersect.userData.events.onover[key]);
				}
			}
		}
		if (lastintersect != null){
			//out
			if (lastintersect.userData.events !== undefined && lastintersect.userData.events.onout !== undefined) {
				for (var key in lastintersect.userData.events.onout) {
					actionTrigger(lastintersect.userData.events.onout[key]);
				}
			}
		}
	}
	lastintersect = intersect;

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

function actionTrigger(action)
{
	switch (action.action) {
		case "changeBubble":
			actionChangeBubble(action.id);
			break;
		case "setProperty":
			actionSetProperty(action.id, action.property, action.value);
			break;
	}
}

function actionChangeBubble(id)
{
	console.log("changeBubble",id);
	currentBubble = data.bubbles[id];
	for( var i = scene.children.length - 1; i > 0; i--){
		objectMap.delete(scene.children[i].userData.id);
		scene.remove(scene.children[i]);
	}
	scene.children[0].material = returnSkyBoxMaterial();
	render();
}

function actionSetProperty(id, property, value)
{
	switch (property) {
		case "opacity":
			objectMap.get(id).material.opacity = value;
			break;
	}
	render();
}