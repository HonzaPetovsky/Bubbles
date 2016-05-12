
Bubbles = function (param)
{
	this.version = 'dev';

	this.canvas = document.getElementById(param.target);
	var bubbles = this;

	
	this.loadingManager = new THREE.LoadingManager();
	this.loadingManager.onProgress = function (item, loaded, total) { bubbles.progress(item, loaded, total); };
	this.loadingManager.onError = function (item) { bubbles.error(item); };
	this.loadingManager.onLoad = function () { bubbles.load(); };

	var loader = new THREE.XHRLoader(this.loadingManager);
	loader.setResponseType('text');

	if (param.file != undefined) {
		try {
			loader.load(param.file, function (text) {
				bubbles.data = JSON.parse(text);
				bubbles.init()
			});
		} catch (err) {
			console.log("error: json loader");
		}
	} else if (param.json != undefined) {
		bubbles.data = param.json;
		bubbles.init()
	} else {
		console.log("error: data not specified");
	}
		
}

Bubbles.prototype.init = function ()
{
	this.data = Bubbles.DataValidator(this.data);
	if (this.data != null) {
		
		this.loader = new Bubbles.Loader({ canvas: this.canvas, data: this.data.loader });

		this.currentBubble = this.data.bubbles[this.data.start];

		this.scene = new THREE.Scene();
		this.sceneOrtho = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(this.data.view.fov.init, this.canvas.offsetWidth/this.canvas.offsetHeight, 0.1, 1000);
		this.camera.target = new THREE.Vector3(1, 0, 0);
		this.camera.lookAt(this.camera.target);

		this.deviceOrientation = new THREE.DeviceOrientationControls(this.camera);

		this.cameraOrtho = new THREE.OrthographicCamera(-this.canvas.offsetWidth/2, this.canvas.offsetWidth/2, this.canvas.offsetHeight/2, -this.canvas.offsetHeight/2, 0, 100);
		this.cameraOrtho.position.z = 10;

		this.renderer = new Bubbles.Renderer(this.canvas, this.scene, this.camera, this.sceneOrtho, this.cameraOrtho);
		this.canvas.appendChild(this.renderer.renderer.domElement);

		this.animation = new Bubbles.Animation(this.renderer, this.deviceOrientation, this.canvas);

		this.objects = new Bubbles.Objects(this.loadingManager, this.renderer);

		this.actionTrigger = new Bubbles.ActionTrigger(this.objects, this.renderer, this.data, this.currentBubble, this.loadingManager, this.loader, this.canvas, this.animation);
		this.actionTrigger.trigger({"action": "changeBubble", "id": this.data.start});

		this.objects.loadHUD(this.data.hud, this.sceneOrtho, this.actionTrigger, this.canvas);

		if (this.data.map !== undefined) {
			this.leaflet = new Bubbles.Leaflet(this.data.map, this.actionTrigger, this.canvas);
			this.canvas.insertBefore(this.leaflet.getDomElement(), this.loader.image);
		}
		this.initEvents();

	} else {
		console.log("error: data");
	}
}

Bubbles.prototype.progress = function (item, loaded, total)
{
	console.log(item, loaded, total);
	this.renderer.render();
}

Bubbles.prototype.error = function (item)
{
	console.log(item, "error: loading error!");
}

Bubbles.prototype.load = function ()
{
	console.log("done");
	if (this.data.map != undefined) {
		this.leaflet.map.invalidateSize();
	}
	this.loader.hide();
}

Bubbles.prototype.initEvents = function ()
{
	var hammer = new Hammer(this.canvas, {domEvents: true});
	hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });
	hammer.get("pinch").set({ enable: true });

	var events = new Bubbles.Events(this.canvas, this.camera, this.renderer, this.cameraOrtho, this.animation);

	var fovmin = this.data.view.fov.min;
	var fovmax = this.data.view.fov.max;
	var scene = this.scene;
	var sceneOrtho = this.sceneOrtho;

	//window
	window.addEventListener("resize", function() { events.onWindowResize(sceneOrtho); });
	window.addEventListener("mozfullscreenchange", function () { events.onFSChange(); });
	window.addEventListener("fullscreenchange", function () { events.onFSChange(); });
	window.addEventListener("webkitfullscreenchange", function () { events.onFSChange(); });

	//mouse
	this.canvas.addEventListener("mousewheel", function (event) { events.onMouseWheel(event, fovmin, fovmax); });
	this.canvas.addEventListener("DOMMouseScroll", function (event) { events.onMouseWheel(event, fovmin, fovmax); });
	this.canvas.addEventListener("mousemove", function (event) { events.onMouseMove(event, scene, sceneOrtho); });
	this.canvas.addEventListener("mousedown", function (event) { events.onMouseDown(); });
	this.canvas.addEventListener("mouseup", function (event) { events.onMouseUp(); });

	//touch
	hammer.on("panstart panend pancancel pan", function (event) { events.onPan(event); });
	hammer.on("pinchin pinchout", function (event) { events.onPinch(event, fovmin, fovmax); });
	hammer.on("tap", function (event) { events.onTap(event, scene, sceneOrtho); });
}

Bubbles.ActionTrigger = function (objects, renderer, data, currentBubble, loadingManager, loader, canvas, animation)
{
	this.objects = objects;
	this.renderer = renderer;
	this.data = data;
	this.currentBubble = currentBubble;
	this.scene = renderer.scene;
	this.sceneOrtho = renderer.sceneOrtho;
	this.loadingManager = loadingManager;
	this.loader = loader;
	this.canvas = canvas;
	this.animation = animation;
}

Bubbles.ActionTrigger.prototype.trigger = function (action)
{
	switch (action.action) {
		case "changeBubble":
			this.loader.start();
			Bubbles.Actions.changeBubble(action, this.data, this.currentBubble, this.scene, this.loadingManager, this.objects, this, this.animation, this.loader);
			break;
		case "setProperty":
			Bubbles.Actions.setProperty(action, this.scene, this.sceneOrtho);
			this.renderer.render();
			break;
		case "toggleFullscreen":
			Bubbles.Actions.toggleFullscreen(this.canvas);
			break;
		case "toggleVideo":
			Bubbles.Actions.toggleVideo(action, this.scene, this.animation);
			break;
		case "startGlass":
			Bubbles.Actions.startGlass(action, this.animation, this.canvas);
			break;
		case "toggleMap":
			Bubbles.Actions.toggleMap();
			break;

		default:
			console.log("unknown action", action.action);
			break;
	}
}

Bubbles.Actions = {};

Bubbles.Actions.changeBubble = function (action, data, currentBubble, scene, loadingManager, objects, actionTrigger, animation, loader)
{
	console.log("changeBubble", action.id);
	currentBubble = data.bubbles[action.id];

	animation.lat = currentBubble.view.lat;
	animation.lon = currentBubble.view.lon;
	animation.start();
	animation.run();
	animation.stopAll();

	for (key in scene.children) {
		scene.children[key].removeEventListener("click", Bubbles.ObjectListener.click);
		scene.children[key].removeEventListener("over", Bubbles.ObjectListener.over);
		scene.children[key].removeEventListener("out", Bubbles.ObjectListener.out);
		scene.children[key].removeEventListener("down", Bubbles.ObjectListener.down);
		scene.children[key].removeEventListener("up", Bubbles.ObjectListener.up);
	}
	scene.children = [];
	scene.add(new Bubbles.Panorama({ image: currentBubble.image, manager: loadingManager }).getMesh());

	objects.loadHotspots(currentBubble.hotspots, scene, actionTrigger);

	if (currentBubble.lensflare !== undefined) {
		scene.add(Bubbles.Lensflare(currentBubble.lensflare.lat, currentBubble.lensflare.lon, currentBubble.lensflare.size ,loadingManager));
	}

	if (currentBubble.image.type == "video") {
		animation.start();
		loader.hide();
	}

}

Bubbles.Actions.setProperty = function (action, scene, sceneOrtho)
{
	var obj = sceneOrtho.getObjectByName(action.id);
	if (obj == undefined) {
		obj = scene.getObjectByName(action.id);
	}
	if (obj != undefined) {
		switch (action.property) {
			case "opacity":
				obj.material.uniforms.opacity.value = action.value;
				break;
			case "visible":
				obj.visible = action.value;
				break;
		}
	}
}

Bubbles.Actions.toggleFullscreen = function (canvas)
{
	canvas.requestFullscreen = canvas.requestFullscreen || canvas.mozRequestFullscreen || canvas.mozRequestFullScreen || canvas.webkitRequestFullscreen;
	document.exitFullscreen = document.exitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;

	if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
}

Bubbles.Actions.toggleVideo = function (action, scene, animation)
{
	var video = scene.getObjectByName(action.id).userData.videoElement;
	if (video.paused) {
		animation.start();
		video.play();
	} else {
		video.pause();
		animation.stop();
	}
}

Bubbles.Actions.startGlass = function (action, animation, canvas)
{
	canvas.requestFullscreen = canvas.requestFullscreen || canvas.mozRequestFullscreen || canvas.mozRequestFullScreen || canvas.webkitRequestFullscreen;
	canvas.requestFullscreen();
	animation.startGlass();
}

Bubbles.Actions.toggleMap = function ()
{
	var map = document.getElementById("bubbles-map");
	if (map.style.display == 'none') {
		map.style.display = 'block';
	} else {
		map.style.display = 'none';
	}
}

Bubbles.Animation = function (renderer, deviceOrientation, canvas)
{
	this.animationCounter = 0;
	this.animationGlass = false;

	this.lat = 0;
	this.lon = 0;

	this.deltaX = 0;
	this.deltaY = 0;

	this.camera = renderer.camera;
	this.renderer = renderer;
	this.deviceOrientation = deviceOrientation;
	this.canvas = canvas;
}


Bubbles.Animation.prototype.update = function (deltaX, deltaY)
{
	this.deltaX = deltaX;
	this.deltaY = deltaY;
}

Bubbles.Animation.prototype.start = function ()
{
	this.animationCounter += 1;
	if (this.animationCounter < 2) {
		this.run();
	}
}

Bubbles.Animation.prototype.startGlass = function ()
{
	this.animationGlass = true;
	this.runGlass();
}

Bubbles.Animation.prototype.stop = function ()
{
	if (this.animationCounter > 0) {
		this.animationCounter -= 1;
	}
	this.deltaX = 0;
	this.deltaY = 0;
}

Bubbles.Animation.prototype.stopGlass = function ()
{
	this.animationGlass = false;
}

Bubbles.Animation.prototype.stopAll = function ()
{
	this.animationCounter = 0;
	this.deltaX = 0;
	this.deltaY = 0;
}

Bubbles.Animation.prototype.run = function ()
{
	var animation = this;
	if (this.animationCounter > 0) {
		requestAnimationFrame(function () { animation.run(); });

		this.lon += this.deltaX*0.005;
		this.lat -= this.deltaY*0.005;

		this.lat = Math.max(-85, Math.min(85, this.lat));
		var phi = THREE.Math.degToRad(90-this.lat);
		var theta = THREE.Math.degToRad(this.lon);

		this.camera.target.x = Math.sin(phi) * Math.cos(theta);
		this.camera.target.y = Math.cos(phi);
		this.camera.target.z = Math.sin(phi) * Math.sin(theta);

		this.camera.lookAt(this.camera.target);
		this.renderer.render();
	}
}

Bubbles.Animation.prototype.runGlass = function ()
{
	var animation = this;
	if (this.animationGlass) {
		requestAnimationFrame(function () { animation.runGlass(); });

		this.deviceOrientation.update();
		this.renderer.renderGlass();
	} else {
		this.renderer.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
		this.renderer.render();
	}
}

Bubbles.DataValidator = function (data)
{
	var newData = {};
	var bubbles = [];

	if (data.bubbles != undefined) {
		for (key in data.bubbles) {
			bubbles.push(key);
		}
	}

	if (bubbles.length > 0) {

		newData.start = data.start in bubbles ? data.start : bubbles[0];

		if (data.loader != undefined && data.loader.color != undefined && data.loader.url != undefined) {
			newData.loader = data.loader;
		} else return null;

		if (data.view != undefined) {
			newData.view = {"fov":{}};
			newData.view.fov.init = data.view.init != undefined ? data.view.init : 75;
			newData.view.fov.max = data.view.max != undefined ? data.view.max : 85;
			newData.view.fov.min = data.view.min != undefined ? data.view.min : 35;
		} else {
			newData.view = {
				"fov": {
					"init": 75,
					"max": 85,
					"min": 35,
				}
			}
		}

		newData.bubbles = data.bubbles;

		for (key in newData.bubbles) {
			var bubble = newData.bubbles[key];

			if (bubble.image == undefined) {
				return null;
			}
			
			if (bubble.view != undefined) {
				bubble.view.lat = bubble.view.lat != undefined ? bubble.view.lat : 0;
				bubble.view.lon = bubble.view.lon != undefined ? bubble.view.lon : 0;
			} else {
				bubble.view = {
					"lat": 0,
					"lon": 0
				}
			}
			
			if (bubble.hotspots == undefined) {
				bubble.hotspots = [];
			}
		} 

		if (newData.hud == undefined) {
			newData.hud = [];
		}
		
		newData.hud = data.hud;
		newData.map = data.map;

	} else return null;

	return newData;
}

Bubbles.Events = function (canvas, camera, renderer, cameraOrtho, animation)
{
	this.animation = animation;

	this.canvas = canvas;
	this.camera = camera;
	this.renderer = renderer;
	this.cameraOrtho = cameraOrtho;

	this.raycaster = new THREE.Raycaster();
	this.intersect = null;

	this.isDown = false;
}

Bubbles.Events.prototype.onWindowResize = function (sceneOrtho)
{
	this.camera.aspect = this.canvas.offsetWidth/this.canvas.offsetHeight;
	this.camera.updateProjectionMatrix();

	this.cameraOrtho.left = -this.canvas.offsetWidth/2;
	this.cameraOrtho.right = this.canvas.offsetWidth/2;
	this.cameraOrtho.top = this.canvas.offsetHeight/2;
	this.cameraOrtho.bottom = -this.canvas.offsetHeight/2;
	this.cameraOrtho.updateProjectionMatrix();

	for (key in sceneOrtho.children) {
		Bubbles.Objects.updateSprite(sceneOrtho.children[key], this.canvas);
	}

	this.renderer.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
	this.renderer.render();
}

Bubbles.Events.prototype.onPan = function (event)
{
	switch (event.type) {
		case 'panstart':
			this.animation.start();
			break;
		case 'panend':
		case 'pancancel':
			this.animation.stop();
			break;
		default:
			this.animation.update(event.deltaX, event.deltaY);
			break;
	}
}

Bubbles.Events.prototype.onPinch = function (event, fovMin, fovMax)
{
	switch (event.type) {
		case 'pinchin':
			this.camera.fov += event.distance * 0.05;
			break;
		case 'pinchout':
			this.camera.fov -= event.distance * 0.05;
			break;
	}
	this.camera.fov = Math.max(fovMin, Math.min(fovMax, this.camera.fov));
	this.camera.updateProjectionMatrix();
	this.renderer.render();
}

Bubbles.Events.prototype.onMouseWheel = function (event, fovMin, fovMax)
{
	if (event.wheelDeltaY) {
		this.camera.fov -= event.wheelDeltaY * 0.05;
	} else if (event.wheelDelta) {
		this.camera.fov -= event.wheelDelta * 0.05;
	} else if (event.detail) {
		this.camera.fov += event.detail * 1.0;
	}
	this.camera.fov = Math.max(fovMin, Math.min(fovMax, this.camera.fov));
	this.camera.updateProjectionMatrix();
	this.renderer.render();
}

Bubbles.Events.prototype.onTap = function (event, scene, sceneOrtho)
{
	var pointer = new THREE.Vector2();
	pointer.x = (event.pointers[0].clientX / this.canvas.offsetWidth) * 2 - 1;
	pointer.y = -(event.pointers[0].clientY / this.canvas.offsetHeight) * 2 + 1;

	this.raycaster.setFromCamera(pointer, this.cameraOrtho);
	var intersect = this.raycaster.intersectObjects(sceneOrtho.children);

	if (intersect.length>0 && !this.animation.animate) {
		intersect = intersect[0].object;
		intersect.dispatchEvent({ type: 'click' });
	} else {
		this.raycaster.setFromCamera(pointer, this.camera);
		intersect = this.raycaster.intersectObjects(scene.children);

		if (intersect.length>1 && !this.animation.animate) {
			intersect = intersect[0].object;
			intersect.dispatchEvent({ type: 'click' });
		}
	}
}

Bubbles.Events.prototype.onMouseMove = function (event, scene, sceneOrtho)
{
	var mouse = new THREE.Vector2();
	mouse.x = ( event.clientX / this.canvas.offsetWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / this.canvas.offsetHeight ) * 2 + 1;

	this.raycaster.setFromCamera(mouse, this.cameraOrtho);
	var intersect = this.raycaster.intersectObjects(sceneOrtho.children);

	if (intersect.length>0 && !this.animation.animate) {
		intersect = intersect[0].object;
	} else {
		this.raycaster.setFromCamera(mouse, this.camera);
		intersect = this.raycaster.intersectObjects(scene.children);

		if (intersect.length>1 && !this.animation.animate) {
			intersect = intersect[0].object;
		} else {
			intersect = null;
		}
	}

	if (intersect !== this.intersect){
		if (intersect != null) {
			intersect.dispatchEvent({ type: 'over' });
		}
		if (this.intersect != null) {
			this.intersect.dispatchEvent({ type: 'out' });

			if (this.isDown) {
				this.onMouseUp();
			}
		}
	}
	this.intersect = intersect;
}

Bubbles.Events.prototype.onMouseDown = function ()
{	
	if (this.intersect != null) {
		this.isDown = true;
		this.intersect.dispatchEvent({ type: 'down' });
	}
}

Bubbles.Events.prototype.onMouseUp = function ()
{
	this.isDown = false;
	if (this.intersect != null) {
		this.intersect.dispatchEvent({ type: 'up' });
	}
}

Bubbles.Events.prototype.onFSChange = function () 
{
	if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
		if (this.animation.animationGlass) {
			this.animation.stopGlass();
		}
	}
}

Bubbles.Hotspot = function (key, hotspotData, manager, actionTrigger)
{
	var hotspot = this;
	var texture = new THREE.TextureLoader(manager).load(hotspotData.url, function () { hotspot.update(); });
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	var geometry = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry(1, 1));

	var uniforms = {
		texture: { type: "t", value: texture },
		opacity: { type: "f", value: 1.0 },
		scale: { type: "v3", value: new THREE.Vector3() }
	};

	if (hotspotData.distorted) {
		uniforms.distorted = { type: "i", value: 1 }
	} else {
		uniforms.distorted = { type: "i", value: 0 }
	}

	

	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: Bubbles.ShaderLib.basicPanoObject.vertexShader,
		fragmentShader: Bubbles.ShaderLib.basicPanoObject.fragmentShader,
		transparent: true,
	});

	this.hotspot = new THREE.Mesh(geometry, material);
	

	this.hotspot.userData = hotspotData;
	this.hotspot.name = key;

	var phi = THREE.Math.degToRad(90-hotspotData.lat);
	var theta = THREE.Math.degToRad(hotspotData.lon);

	var position = new THREE.Vector3(0, 0, 0);
	position.x = 100* Math.sin(phi) * Math.cos(theta);
	position.y = 100* Math.cos(phi);
	position.z = 100* Math.sin(phi) * Math.sin(theta);

	this.hotspot.position.set(position.x, position.y, position.z);
	this.hotspot.rotation.order = 'YXZ';
	this.hotspot.rotation.y = -THREE.Math.degToRad(hotspotData.lon+90);
	this.hotspot.rotation.x = THREE.Math.degToRad(hotspotData.lat);

	this.hotspot.userData.actionTrigger = actionTrigger;
	if (hotspotData.events !== undefined) {
		if (hotspotData.events.onclick !== undefined) {
			this.hotspot.addEventListener("click", Bubbles.ObjectListener.click);
		}
		if (hotspotData.events.onover !== undefined) {
			this.hotspot.addEventListener("over", Bubbles.ObjectListener.over);
		}
		if (hotspotData.events.onout !== undefined) {
			this.hotspot.addEventListener("out", Bubbles.ObjectListener.out);
		}
		if (hotspotData.events.ondown !== undefined) {
			this.hotspot.addEventListener("down", Bubbles.ObjectListener.down);
		}
		if (hotspotData.events.onup !== undefined) {
			this.hotspot.addEventListener("up", Bubbles.ObjectListener.up);
		}
	}
}

Bubbles.Hotspot.prototype.update = function ()
{
	this.hotspot.scale.x = this.hotspot.material.uniforms.texture.value.image.width *0.2;
	this.hotspot.scale.y = this.hotspot.material.uniforms.texture.value.image.height *0.2;
	this.hotspot.material.uniforms.scale.value.x = this.hotspot.material.uniforms.texture.value.image.width *0.2;
	this.hotspot.material.uniforms.scale.value.y = this.hotspot.material.uniforms.texture.value.image.height *0.2;
}

Bubbles.Hotspot.prototype.getMesh = function ()
{
	return this.hotspot;
}

Bubbles.Lensflare = function (lat, lon, size, manager)
{
	var textureLoader = new THREE.TextureLoader(this.loadingManager);
	var textureFlare0 = textureLoader.load("../lensflare/lensflare0.png");
	var textureFlare2 = textureLoader.load("../lensflare/lensflare2.png");
	var textureFlare3 = textureLoader.load("../lensflare/lensflare3.png");
	
	var flareColor = new THREE.Color( 0xffffff );

	var lensflare = new THREE.LensFlare(textureFlare0, 700*size, 0.0, THREE.AdditiveBlending, flareColor);

	lensflare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
	lensflare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
	lensflare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
	lensflare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
	lensflare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
	lensflare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
	lensflare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);


	var phi = THREE.Math.degToRad(90-lat);
	var theta = THREE.Math.degToRad(lon);

	var position = new THREE.Vector3(0, 0, 0);
	position.x = 100* Math.sin(phi) * Math.cos(theta);
	position.y = 100* Math.cos(phi);
	position.z = 100* Math.sin(phi) * Math.sin(theta);


	lensflare.position.set(position.x, position.y, position.z);

	return lensflare;
}

Bubbles.Loader = function (param)
{
	this.image = document.createElement('div');
	this.image.style.cssText  = 'position:absolute;width:100%;height:100%;z-index:1000;';
	this.image.style.cssText += 'background-color:'+param.data.color+';';
	this.image.style.cssText += 'background-image: url('+param.data.url+');background-repeat: no-repeat;background-position: center center;';
	param.canvas.appendChild(this.image);
}

Bubbles.Loader.prototype.start = function ()
{
	this.image.style.display = "initial";
}

Bubbles.Loader.prototype.hide = function ()
{
	this.image.style.display = "none";
}

Bubbles.ObjectListener = {}

Bubbles.ObjectListener.click = function (event)
{
	for (var key in event.target.userData.events.onclick) {
		event.target.userData.actionTrigger.trigger(event.target.userData.events.onclick[key]);
	}
}

Bubbles.ObjectListener.over = function (event)
{
	for (var key in event.target.userData.events.onover) {
		event.target.userData.actionTrigger.trigger(event.target.userData.events.onover[key]);
	}
}

Bubbles.ObjectListener.out = function (event)
{
	for (var key in event.target.userData.events.onout) {
		event.target.userData.actionTrigger.trigger(event.target.userData.events.onout[key]);
	}
}

Bubbles.ObjectListener.down = function (event)
{
	for (var key in event.target.userData.events.ondown) {
		event.target.userData.actionTrigger.trigger(event.target.userData.events.ondown[key]);
	}
}

Bubbles.ObjectListener.up = function (event)
{
	for (var key in event.target.userData.events.onup) {
		event.target.userData.actionTrigger.trigger(event.target.userData.events.onup[key]);
	}
}

Bubbles.Objects = function (loadingManager, renderer)
{
	this.loadingManager = loadingManager;
	this.renderer = renderer;
}

Bubbles.Objects.prototype.loadHotspots = function (hotspots, scene, actionTrigger)
{
	for (var key in hotspots) {
		
		var hotspot;
		switch (hotspots[key].type) {
			case "image":
				hotspot = new Bubbles.Hotspot(key, hotspots[key], this.loadingManager, actionTrigger);
				break;
			case "video":
				hotspot = new Bubbles.VideoHotspot(key, hotspots[key], this.loadingManager, actionTrigger, this.renderer);
				break;
		}

		scene.add(hotspot.getMesh());
	}
}

Bubbles.Objects.prototype.loadHUD = function (hud, scene, actionTrigger, canvas)
{
	for (var key in hud) {
		var layer = new Bubbles.Sprite(key, hud[key], this.loadingManager, actionTrigger, canvas);

		scene.add(layer.getMesh());
	}
}

Bubbles.Objects.updateSprite = function (sprite, canvas)
{
	var imageWidth = sprite.material.uniforms.texture.value.image.width;
	var imageHeight = sprite.material.uniforms.texture.value.image.height;

	sprite.material.uniforms.scale.value.x = imageWidth;
	sprite.material.uniforms.scale.value.y = imageHeight;

	sprite.scale.set(imageWidth, imageHeight, 1);

	switch (sprite.userData.align) {
		case 'left':
			sprite.position.set(canvas.offsetWidth/2+imageWidth/2+sprite.userData.position.x, sprite.position.y, sprite.position.z);
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

Bubbles.Panorama = function (param)
{
	this.manager = param.manager;

	switch (param.image.type) {
		case 'cube': 
			this.cubicPanorama(param.image.data);
			break;
		case 'sphere':
			this.spherePanorama(param.image.data);
			break;
		case 'video':
			this.videoPanorama(param.image.data);
			break;
	}
}

Bubbles.Panorama.prototype.cubicPanorama = function (image)
{
	var geometry = new THREE.BoxGeometry(500, 500, 500);
	geometry.scale(-1, 1, 1);
	var bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);

	this.mesh = new THREE.Mesh(bufferGeometry, this.getSkyboxMaterial(image));
}

Bubbles.Panorama.prototype.spherePanorama = function (image)
{
	var geometry = new THREE.SphereGeometry(500, 60, 40);
	geometry.scale(-1, 1, 1);
	var bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);

	this.mesh = new THREE.Mesh(bufferGeometry, this.getSphereMaterial(image));
}

Bubbles.Panorama.prototype.videoPanorama = function (image)
{
	var geometry = new THREE.SphereGeometry(500, 60, 40);
	geometry.scale(-1, 1, 1);
	var bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);

	this.mesh = new THREE.Mesh(bufferGeometry, this.getVideoMaterial(image));
}

Bubbles.Panorama.prototype.getMesh = function()
{
	return this.mesh;
}

Bubbles.Panorama.prototype.getSkyboxMaterial = function (image)
{
	var loader = new THREE.CubeTextureLoader(this.manager);
	var texture = loader.load([
		image.back,
		image.front,
		image.up,
		image.down,
		image.right,
		image.left
	]);

	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	return new THREE.ShaderMaterial({
		uniforms: {
			"tCube": { type: "t", value: texture },
			"tFlip": { type: "f", value: - 1 }
		},
		vertexShader: THREE.ShaderLib.cube.vertexShader,
		fragmentShader: THREE.ShaderLib.cube.fragmentShader,
	});
}

Bubbles.Panorama.prototype.getSphereMaterial = function (image)
{
	var loader = new THREE.TextureLoader(this.manager);
	var texture = loader.load(image);

	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	material = new THREE.ShaderMaterial({
		uniforms: {
			"texture": { type: "t", value: texture },
		},
		vertexShader: Bubbles.ShaderLib.spherePanorama.vertexShader,
		fragmentShader: Bubbles.ShaderLib.spherePanorama.fragmentShader,
	});

	return material;
}

Bubbles.Panorama.prototype.getVideoMaterial = function (image)
{
	var video = document.createElement( 'video' );
	
	video.autoplay = true;
	video.loop = true;
	
	if (video.canPlayType('video/mp4') && image.mp4 != undefined) {
		video.src = image.mp4;
	} else if (video.canPlayType('video/ogg') && image.ogg != undefined) {
		video.src = image.ogg;
	} else if (video.canPlayType('video/webm') && image.webm != undefined) {
		video.src = image.webm;
	} else {
		console.log("error: video not supported");
	}

	

	var texture = new THREE.VideoTexture( video );
	texture.minFilter = THREE.LinearFilter;
	texture.format = THREE.RGBFormat;
	var material = new THREE.MeshBasicMaterial( { map : texture } );
	return material;
}

Bubbles.Renderer = function (canvas, scene, camera, sceneOrtho, cameraOrtho)
{
	this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	this.renderer.setPixelRatio( window.devicePixelRatio );
	this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
	this.renderer.autoClear = false;

	this.scene = scene;
	this.camera = camera;

	this.sceneOrtho = sceneOrtho;
	this.cameraOrtho = cameraOrtho;
}

Bubbles.Renderer.prototype.render = function ()
{
	this.renderer.clear();
	this.renderer.render(this.scene, this.camera);

	this.renderer.clearDepth();
	this.renderer.render(this.sceneOrtho, this.cameraOrtho);
}

Bubbles.Renderer.prototype.renderGlass = function ()
{
	this.renderer.setViewport(0,0,this.renderer.getSize().width/2,this.renderer.getSize().height);
	this.renderer.render(this.scene, this.camera);

	this.renderer.setViewport(this.renderer.getSize().width/2,0,this.renderer.getSize().width/2,this.renderer.getSize().height);
	this.renderer.render(this.scene, this.camera);
}

Bubbles.Sprite = function (key, spriteData, manager, actionTrigger, canvas)
{
	this.canvas = canvas;

	var sprite = this;
	var texture = new THREE.TextureLoader(manager).load(spriteData.url, function () { sprite.update(); });
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	var geometry = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry(1, 1));
	
	var material = new THREE.ShaderMaterial({
		uniforms: {
			texture: { type: "t", value: texture },
			opacity: { type: "f", value: 1.0 },
			scale: { type: "v3", value: new THREE.Vector3() },
			distorted: { type: "i", value: 0 },
		},
		vertexShader: Bubbles.ShaderLib.basicPanoObject.vertexShader,
		fragmentShader: Bubbles.ShaderLib.basicPanoObject.fragmentShader,
		transparent: true,
	});

	this.sprite = new THREE.Mesh(geometry, material);

	this.sprite.userData = spriteData;
	this.sprite.name = key;

	this.sprite.position.set(spriteData.position.x, spriteData.position.y, spriteData.position.zorder);

	this.sprite.userData.actionTrigger = actionTrigger;
	if (spriteData.events !== undefined) {
		if (spriteData.events.onclick !== undefined) {
			this.sprite.addEventListener("click", Bubbles.ObjectListener.click);
		}
		if (spriteData.events.onover !== undefined) {
			this.sprite.addEventListener("over", Bubbles.ObjectListener.over);
		}
		if (spriteData.events.onout !== undefined) {
			this.sprite.addEventListener("out", Bubbles.ObjectListener.out);
		}
		if (spriteData.events.ondown !== undefined) {
			this.sprite.addEventListener("down", Bubbles.ObjectListener.down);
		}
		if (spriteData.events.onup !== undefined) {
			this.sprite.addEventListener("up", Bubbles.ObjectListener.up);
		}
	}
}

Bubbles.Sprite.prototype.update = function ()
{
	Bubbles.Objects.updateSprite(this.sprite, this.canvas);
}

Bubbles.Sprite.prototype.getMesh = function ()
{
	return this.sprite;
}

Bubbles.VideoHotspot = function (key, hotspotData, manager, actionTrigger, renderer)
{
	var video = document.createElement('video');
	video.autoplay = false;
	video.loop = false;
	video.src = hotspotData.url;

	if (video.canPlayType('video/mp4') && hotspotData.url.mp4 != undefined) {
		video.src = hotspotData.url.mp4;
	} else if (video.canPlayType('video/ogg') && hotspotData.url.ogg != undefined) {
		video.src = hotspotData.url.ogg;
	} else if (video.canPlayType('video/webm') && hotspotData.url.webm != undefined) {
		video.src = hotspotData.url.webm;
	} else {
		console.log("error: video not supported");
	}

	var hotspot = this;
	video.onloadedmetadata = function () { 
		hotspot.update();
	}

	video.onended = function () {
		video.currentTime = 0;
	}	
	
	video.onloadeddata = function () {
		renderer.render();
	}

	var geometry = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry(1, 1));

	var texture = new THREE.VideoTexture(video);
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	
	var mask = hotspotData.mask ? 1 : 0;
	var uniforms = {
		texture: { type: "t", value: texture },
		mask: { type: "i", value: mask }
	};
	
	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: Bubbles.ShaderLib.video.vertexShader,
		fragmentShader: Bubbles.ShaderLib.video.fragmentShader,
		transparent: true,
	});
	
	this.hotspot = new THREE.Mesh(geometry, material);

	this.hotspot.name = key;
	this.hotspot.userData = hotspotData;
	this.hotspot.userData.videoElement = video;

	var phi = THREE.Math.degToRad(90-hotspotData.lat);
	var theta = THREE.Math.degToRad(hotspotData.lon);

	var position = new THREE.Vector3(0, 0, 0);
	position.x = 100* Math.sin(phi) * Math.cos(theta);
	position.y = 100* Math.cos(phi);
	position.z = 100* Math.sin(phi) * Math.sin(theta);

	this.hotspot.position.set(position.x, position.y, position.z);
	this.hotspot.rotation.order = 'YXZ';
	this.hotspot.rotation.y = -THREE.Math.degToRad(hotspotData.lon+90);
	this.hotspot.rotation.x = THREE.Math.degToRad(hotspotData.lat);


	this.hotspot.userData.actionTrigger = actionTrigger;
	if (hotspotData.events !== undefined) {
		if (hotspotData.events.onclick !== undefined) {
			this.hotspot.addEventListener("click", Bubbles.ObjectListener.click);
		}
		if (hotspotData.events.onover !== undefined) {
			this.hotspot.addEventListener("over", Bubbles.ObjectListener.over);
		}
		if (hotspotData.events.onout !== undefined) {
			this.hotspot.addEventListener("out", Bubbles.ObjectListener.out);
		}
		if (hotspotData.events.ondown !== undefined) {
			this.hotspot.addEventListener("down", Bubbles.ObjectListener.down);
		}
		if (hotspotData.events.onup !== undefined) {
			this.hotspot.addEventListener("up", Bubbles.ObjectListener.up);
		}
	}

}

Bubbles.VideoHotspot.prototype.update = function ()
{
	this.hotspot.scale.x = this.hotspot.userData.videoElement.videoWidth *0.2;
	if (this.hotspot.userData.mask) {
		this.hotspot.scale.y = this.hotspot.userData.videoElement.videoHeight *0.2/2;
	} else {
		this.hotspot.scale.y = this.hotspot.userData.videoElement.videoHeight *0.2;
	}
}

Bubbles.VideoHotspot.prototype.getMesh = function ()
{
	return this.hotspot;
}

Bubbles.ShaderLib = {

	spherePanorama: {

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",
				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D texture;",
			"varying vec2 vUv;",

			"void main() {",
				"vec4 texel = texture2D( texture, vUv );",
				"gl_FragColor = texel;",
			"}"

		].join( "\n" )	
	},

	basicPanoObject: {

		vertexShader: [

			"varying vec2 vUv;",
			"uniform vec3 scale;",
			"uniform int distorted;",

			"void main() {",
				"vUv = uv;",
				"float rotation = 0.0;",

				"if (distorted == 0){",
					"vec3 alignedPosition = vec3(position.x * scale.x, position.y * scale.y, position.z * scale.z);",

					"vec2 rotatedPosition;",
					"rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;",
					"rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;",

					"vec4 finalPosition;",
					"finalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );",
					"finalPosition.xy += rotatedPosition;",
					"finalPosition = projectionMatrix * finalPosition;",

					"gl_Position = finalPosition;",
				"}",
				"else {",
					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
				"}",

					
			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform float opacity;",
			"uniform sampler2D texture;",
			"varying vec2 vUv;",

			"void main() {",
				"vec4 texel = texture2D( texture, vUv );",
				"texel.a = texel.a * opacity;",
				"gl_FragColor = texel;",
			"}"

		].join( "\n" )	
	},

	video: {

		vertexShader: [

			"varying vec2 uvColor;",
			"varying vec2 uvAlpha;",
			"uniform int mask;",

			"void main() {",
				"uvColor = uv;",
				"uvAlpha = uv;",

				"float rotation = 0.0;",

				"if (mask != 0){",
					"uvColor.y = uvColor.y * 0.5 + 0.5;",
					"uvAlpha.y = uvAlpha.y * 0.5;",
				"}",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D texture;",
			"varying vec2 uvColor;",
			"varying vec2 uvAlpha;",
			"uniform int mask;",

			"void main() {",
				"vec4 texel = texture2D( texture, uvColor );",
				"vec4 texelAlpha = texture2D ( texture, uvAlpha );",

				"if (mask != 0){",
					"texel.a = (texelAlpha.r + texelAlpha.g + texelAlpha.b)/3.0;",
				"}",

				"gl_FragColor = texel;",
			"}"

		].join( "\n" )	
	}

}

/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function( object ) {

	var scope = this;

	this.object = object;
	this.object.rotation.reorder( "YXZ" );

	this.enabled = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	this.alpha = 0;
	this.alphaOffsetAngle = 0;


	var onDeviceOrientationChangeEvent = function( event ) {

		scope.deviceOrientation = event;

	};

	var onScreenOrientationChangeEvent = function() {

		scope.screenOrientation = window.orientation || 0;

	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	var setObjectQuaternion = function() {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function( quaternion, alpha, beta, gamma, orient ) {

			euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler ); // orient the device

			quaternion.multiply( q1 ); // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation

		}

	}();

	this.connect = function() {

		onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = true;

	};

	this.disconnect = function() {

		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = false;

	};

	this.update = function() {

		if ( scope.enabled === false ) return;

		var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) + this.alphaOffsetAngle : 0; // Z
		var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad( scope.deviceOrientation.beta ) : 0; // X'
		var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
		var orient = scope.screenOrientation ? THREE.Math.degToRad( scope.screenOrientation ) : 0; // O

		setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
		this.alpha = alpha;

	};

	this.updateAlphaOffsetAngle = function( angle ) {

		this.alphaOffsetAngle = angle;
		this.update();

	};

	this.dispose = function() {

		this.disconnect();

	};

	this.connect();

};

Bubbles.Leaflet = function (mapData, actionTrigger, canvas)
{
	this.leaflet = document.createElement('div');
	this.leaflet.id = "bubbles-map";
	this.leaflet.style.cssText  = 'position:absolute;';
	this.leaflet.style.width = mapData.width+"px";
	this.leaflet.style.height = mapData.height+"px";

	switch (mapData.align) {
		case 'center':
			var left = canvas.offsetWidth/2-mapData.width/2+mapData.position.x;
			var top = canvas.offsetHeight/2-mapData.height/2-mapData.position.y;
			this.leaflet.style.top = top+"px";
			this.leaflet.style.left = left+"px";
			break;
		case 'left':
			var top = canvas.offsetHeight/2-mapData.height/2-mapData.position.y;
			this.leaflet.style.top = top+"px";
			this.leaflet.style.left = mapData.position.x+"px";
			break;
		case 'right':
			var top = canvas.offsetHeight/2-mapData.height/2-mapData.position.y;
			this.leaflet.style.top = top+"px";
			this.leaflet.style.right = mapData.position.x+"px";
			break;
		case 'top':
			var left = canvas.offsetWidth/2-mapData.width/2+mapData.position.x;
			this.leaflet.style.top = mapData.position.y+"px";
			this.leaflet.style.left = left+"px";
			break;
		case 'bottom':
			var left = canvas.offsetWidth/2-mapData.width/2+mapData.position.x;
			this.leaflet.style.bottom = mapData.position.y+"px";
			this.leaflet.style.left = left+"px";
			break;
		case 'lefttop':
		case 'topleft':
			this.leaflet.style.top = mapData.position.y+"px";
			this.leaflet.style.left = mapData.position.x+"px";
			break;
		case 'leftbottom':
		case 'bottomleft':
			this.leaflet.style.bottom = mapData.position.y+"px";
			this.leaflet.style.left = mapData.position.x+"px";
			break;
		case 'righttop':
		case 'topright':
			this.leaflet.style.top = mapData.position.y+"px";
			this.leaflet.style.right = mapData.position.x+"px";
			break;
		case 'rightbottom':
		case 'bottomright':
			this.leaflet.style.bottom = mapData.position.y+"px";
			this.leaflet.style.right = mapData.position.x+"px";
			break;
	}

	if (!mapData.visible) {
		this.leaflet.style.display = 'none';
	}

	this.map = L.map(this.leaflet).setView([mapData.map.lat, mapData.map.lon], mapData.map.zoom);

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(this.map);


	var bubblesMarker = L.Marker.extend({
		options: { 
			target: null
		}
	});

	for (key in mapData.markers) {
		new bubblesMarker([mapData.markers[key].lat, mapData.markers[key].lon], {target: mapData.markers[key].target}).on('click', function() {
			actionTrigger.trigger({"action": "changeBubble", "id": this.options.target})
		}).addTo(this.map);
	}
}

Bubbles.Leaflet.prototype.getDomElement = function ()
{
	return this.leaflet;
}
