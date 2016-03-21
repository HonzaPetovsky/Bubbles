Bubbles.Renderer = function (canvas, scene, camera)
{
	this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
	this.renderer.autoClear = false;

	this.scene = scene;
	this.camera = camera;
}

Bubbles.Renderer.prototype.render = function ()
{
	this.renderer.clear();
	this.renderer.render(this.scene, this.camera);
}