Bubbles.Events = function (canvas, camera, renderer)
{
	this.panAnimation = new Bubbles.Animation(camera, renderer);
	this.canvas = canvas;
	this.camera = camera;
	this.renderer = renderer;

	this.raycaster = new THREE.Raycaster();
	this.intersect = null;

	this.isDown = false;
}

Bubbles.Events.prototype.onWindowResize = function ()
{
	this.camera.aspect = this.canvas.offsetWidth/this.canvas.offsetHeight;
	this.camera.updateProjectionMatrix();

	this.renderer.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
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

Bubbles.Events.prototype.onTap = function (event, scene)
{
	var pointer = new THREE.Vector2();
	pointer.x = (event.pointers[0].clientX / this.canvas.offsetWidth) * 2 - 1;
	pointer.y = -(event.pointers[0].clientY / this.canvas.offsetHeight) * 2 + 1;

	this.raycaster.setFromCamera(pointer, this.camera);
	var intersect = this.raycaster.intersectObjects(scene.children);
	
	if (intersect.length>1 && !this.panAnimation.animate) {
		intersect = intersect[0].object;
		intersect.dispatchEvent({ type: 'click' });
	}
}

Bubbles.Events.prototype.onMouseMove = function (event, scene)
{
	var mouse = new THREE.Vector2();
	mouse.x = ( event.clientX / this.canvas.offsetWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / this.canvas.offsetHeight ) * 2 + 1;

	this.raycaster.setFromCamera(mouse, this.camera);
	var intersect = this.raycaster.intersectObjects(scene.children);
	
	if (intersect.length>1 && !this.panAnimation.animate) {
		intersect = intersect[0].object;
	} else {
		intersect = null;
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
	if (this.intersect != null) {
		this.isDown = false;
		this.intersect.dispatchEvent({ type: 'up' });
	}
}