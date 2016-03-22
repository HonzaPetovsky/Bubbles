Bubbles = function (param)
{
	this.version = 'dev';

	this.canvas = document.getElementById(param.target);
	var bubbles = this;
	
	this.loadingManager = new THREE.LoadingManager();
	this.loadingManager.onProgress = function (item, loaded, total) {bubbles.progress(item, loaded, total);};
	this.loadingManager.onError = function (item) {bubbles.error(item);};
	this.loadingManager.onLoad = function () {bubbles.load();};

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
	this.camera = Bubbles.PerspectiveCamera(this.currentBubble.view.fov.init, this.canvas.offsetWidth/this.canvas.offsetHeight, 0.1, 1000);

	this.renderer = new Bubbles.Renderer(this.canvas, this.scene, this.camera);
	this.canvas.appendChild(this.renderer.renderer.domElement);

	this.scene.add(new Bubbles.Panorama({ image: this.currentBubble.image, manager: this.loadingManager }).getMesh());

	this.objects = new Bubbles.Objects(this.loadingManager);
	this.objects.loadHotspots(this.currentBubble.hotspots, this.scene);

	this.renderer.render();

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
	var bubbles = this;

	this.events = new Bubbles.Events(bubbles.canvas, bubbles.camera, bubbles.renderer);
	var hammer = new Hammer(this.canvas);
	hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });
	hammer.get("pinch").set({ enable: true });

	window.addEventListener("resize", function() { bubbles.events.onWindowResize(); });
	hammer.on("panstart panend pancancel pan", function (event) { bubbles.events.onPan(event); });
	
	hammer.on("pinchin pinchout", function (event) { bubbles.events.onPinch(event, bubbles.currentBubble.view.fov.min, bubbles.currentBubble.view.fov.max); });
	this.canvas.addEventListener("mousewheel", function (event) { bubbles.events.onMouseWheel(event, bubbles.currentBubble.view.fov.min, bubbles.currentBubble.view.fov.max); });
	this.canvas.addEventListener("DOMMouseScroll", function (event) { bubbles.events.onMouseWheel(event, bubbles.currentBubble.view.fov.min, bubbles.currentBubble.view.fov.max); });

	hammer.on("tap", function (event) { bubbles.events.onTap(event, bubbles.scene); });

	this.canvas.addEventListener("mousemove", function (event) { bubbles.events.onMouseMove(event, bubbles.scene); });
	this.canvas.addEventListener("mousedown", function (event) { bubbles.events.onMouseDown(); });
	this.canvas.addEventListener("mouseup", function (event) { bubbles.events.onMouseUp(); });
}