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

	try {
		loader.load(param.data, function (text) {
			bubbles.data = JSON.parse(text);
			bubbles.init()
		});
	} catch (err) {
		console.log("error: json loader");
	}
}

Bubbles.prototype.init = function ()
{
	this.data = Bubbles.DataValidator(this.data);
	this.loader = new Bubbles.Loader({ canvas: this.canvas, data: this.data.loader });

	this.currentBubble = this.data.bubbles[this.data.start];

	this.scene = new THREE.Scene();
	this.sceneOrtho = new THREE.Scene();

	this.camera = new THREE.PerspectiveCamera(this.data.view.fov.init, this.canvas.offsetWidth/this.canvas.offsetHeight, 0.1, 1000);
	this.camera.target = new THREE.Vector3(1, 0, 0);
	this.camera.position.z = 0.1;
	this.camera.lookAt(this.camera.target);

	this.cameraOrtho = new THREE.OrthographicCamera(-this.canvas.offsetWidth/2, this.canvas.offsetWidth/2, this.canvas.offsetHeight/2, -this.canvas.offsetHeight/2, 0, 100);
	this.cameraOrtho.position.z = 10;

	this.renderer = new Bubbles.Renderer(this.canvas, this.scene, this.camera, this.sceneOrtho, this.cameraOrtho);
	this.canvas.appendChild(this.renderer.renderer.domElement);

	this.animation = new Bubbles.Animation(this.renderer);

	this.objects = new Bubbles.Objects(this.loadingManager);

	this.actionTrigger = new Bubbles.ActionTrigger(this.objects, this.renderer, this.data, this.currentBubble, this.loadingManager, this.loader, this.canvas, this.animation);
	this.actionTrigger.trigger({"action": "changeBubble", "id": this.data.start});

	this.objects.loadUI(this.data.ui, this.sceneOrtho, this.actionTrigger, this.canvas);


	this.controls = new Bubbles.Controls();
	this.initEvents();

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
	this.loader.hide();
}

Bubbles.prototype.initEvents = function ()
{
	var hammer = new Hammer(this.canvas);
	hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });
	hammer.get("pinch").set({ enable: true });

	var events = new Bubbles.Events(this.canvas, this.camera, this.renderer, this.cameraOrtho, this.animation);

	var fovmin = this.data.view.fov.min;
	var fovmax = this.data.view.fov.max;
	var scene = this.scene;
	var sceneOrtho = this.sceneOrtho;

	//window
	window.addEventListener("resize", function() { events.onWindowResize(sceneOrtho); });

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

