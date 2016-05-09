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
	console.log("render");
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