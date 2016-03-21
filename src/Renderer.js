Bubbles.Renderer = function (canvas, scene, camera, sceneOrtho, cameraOrtho)
{
	this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
	this.renderer.autoClear = false;

	this.scene = scene;
	this.sceneOrtho = sceneOrtho;
	this.camera = camera;
	this.cameraOrtho = cameraOrtho;
}

Bubbles.Renderer.prototype.render = function ()
{
	this.renderer.clear();
	this.renderer.render(this.scene, this.camera);

	this.renderer.clearDepth();
	this.renderer.render(this.sceneOrtho, this.cameraOrtho);
}