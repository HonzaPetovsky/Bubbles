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
	this.sceneOrtho = new THREE.Scene();

	this.camera = Bubbles.PerspectiveCamera(this.currentBubble.view.fov.init, this.canvas.offsetWidth/this.canvas.offsetHeight, 0.1, 1000);
	this.cameraOrtho = Bubbles.OrthographicCamera(-this.canvas.offsetWidth/2, this.canvas.offsetWidth/2, this.canvas.offsetHeight/2, -this.canvas.offsetHeight/2, 0, 100);

	this.renderer = new Bubbles.Renderer(this.canvas, this.scene, this.camera, this.sceneOrtho, this.cameraOrtho);
	this.canvas.appendChild(this.renderer.renderer.domElement);

	this.scene.add(new Bubbles.Panorama({ image: this.currentBubble.image, manager: this.loadingManager }).getMesh());
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
	this.events = new Bubbles.Events(bubbles.camera, bubbles.renderer);

	var hammer = new Hammer(this.canvas);
	hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL});

	window.addEventListener('resize', function() { bubbles.events.onWindowResize(bubbles.canvas, bubbles.camera, bubbles.cameraOrtho, bubbles.renderer); });
	
	hammer.on("panstart panend pancancel pan", function (event) { bubbles.events.onPan(event, bubbles.camera, bubbles.renderer) });
}