Bubbles.Events = function (camera, renderer)
{
	this.panAnimation = new Bubbles.Animation(camera, renderer);
	this.camera = camera;
	this.renderer = renderer;
}

Bubbles.Events.prototype.onWindowResize = function (canvas)
{
	this.camera.aspect = canvas.offsetWidth/canvas.offsetHeight;
	this.camera.updateProjectionMatrix();

	this.renderer.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
	this.renderer.render();
}

Bubbles.Events.prototype.onPan = function (event)
{
	switch (event.type) {
		case 'panstart':
			this.panAnimation.start();
			break;
		case 'panend':
		case 'pancancel':
			this.panAnimation.stop();
			break;
		default:
			this.panAnimation.update(event.deltaX, event.deltaY);
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