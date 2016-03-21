Bubbles.Events = function (camera, renderer)
{
	this.panAnimation = new Bubbles.Animation(camera, renderer);
}

Bubbles.Events.prototype.onWindowResize = function (canvas, camera, cameraOrtho, renderer)
{
	camera.aspect = canvas.offsetWidth/canvas.offsetHeight;
	camera.updateProjectionMatrix();

	cameraOrtho.left = -canvas.offsetWidth/2;
	cameraOrtho.right = canvas.offsetWidth/2;
	cameraOrtho.top = canvas.offsetHeight/2;
	cameraOrtho.bottom = -canvas.offsetHeight/2;
	cameraOrtho.updateProjectionMatrix();

	renderer.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
	renderer.render();
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