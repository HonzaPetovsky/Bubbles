Bubbles.Scene = function (ctx)
{
	this.ctx = ctx;

	this.canvas = this.ctx.canvas;
	this.loadingManager = this.ctx.loader.loadingManager;
	this.data = null;

	this.lat = 0;
	this.lon = 0; 

	this.loadJson(this.ctx.dataUrl);
	return this;
}

Bubbles.Scene.prototype.loadJson = function (url)
{
	var loader = new THREE.XHRLoader(this.loadingManager);
	loader.setResponseType('json');

	var obj = this;
	try {
		loader.load(url, function (text) {
			obj.data = text;
			obj.init();
		});
	} catch (err) {
		console.log("error: json loader");
	}
}

Bubbles.Scene.prototype.init = function ()
{
	this.data = new Bubbles.DataValidator(this.data);
	this.ctx.loader.init(this.data.loader);


	this.currentBubble = this.data.bubbles[this.data.start];

	this.scene = new THREE.Scene();
	this.sceneOrtho = new THREE.Scene();

	this.camera = new THREE.PerspectiveCamera(this.currentBubble.view.fov.init, this.canvas.offsetWidth/this.canvas.offsetHeight, 0.1, 1000);
	this.camera.target = new THREE.Vector3(1, 0, 0);
	this.camera.lookAt(this.camera.target);

	this.cameraOrtho = new THREE.OrthographicCamera( -this.canvas.offsetWidth/2, this.canvas.offsetWidth/2, this.canvas.offsetHeight/2, -this.canvas.offsetHeight/2, 0, 100);
	this.cameraOrtho.position.z = 10;

	this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
	this.renderer.autoClear = false;

	this.canvas.appendChild(this.renderer.domElement);

	this.geometry = new THREE.BoxGeometry(500, 500, 500);
	this.geometry.scale(-1, 1, 1);

	this.cube = new THREE.Mesh(this.geometry, new Bubbles.Skybox(this.currentBubble, this.loadingManager));
	this.scene.add(this.cube);

	this.ctx.objects.loadSprites(this.data.sprites);
	this.ctx.objects.loadHotspots(this.currentBubble.hotspots);

	this.render();
}

Bubbles.Scene.prototype.render = function ()
{
	this.renderer.clear();
	this.renderer.render(this.scene, this.camera);

	this.renderer.clearDepth();
	this.renderer.render(this.sceneOrtho, this.cameraOrtho);
}