Bubbles.Events = function (ctx)
{
	this.ctx = ctx;

	this.isUserInteracting = false;
	this.animate = false;


	this.raycaster = new THREE.Raycaster();
	this.intersect = null;
	this.lastintersect = null;

	this.mouseX = 0;
	this.mouseY = 0;
	this.mouseDownX = 0;
	this.mouseDownY = 0;


	var obj = this;
	window.addEventListener('resize', function() {obj.onWindowResize();});
	ctx.canvas.addEventListener('mousedown', function(event) {obj.onMouseDown(event);});
	ctx.canvas.addEventListener('mouseup', function() {obj.onMouseUp();});
	ctx.canvas.addEventListener('click', function() {obj.onMouseClick();});
	ctx.canvas.addEventListener('mouseout', function() {obj.onMouseUp();});
	ctx.canvas.addEventListener('mousemove', function(event) {obj.onMouseMove(event);});
	ctx.canvas.addEventListener('mousewheel', function(event) {obj.onMouseWheel(event);});
	ctx.canvas.addEventListener('DOMMouseScroll', function(event) {obj.onMouseWheel(event);});
}


Bubbles.Events.prototype.onWindowResize = function ()
{
	this.ctx.scene.camera.aspect = this.ctx.canvas.offsetWidth/this.ctx.canvas.offsetHeight;
	this.ctx.scene.camera.updateProjectionMatrix();

	this.ctx.scene.cameraOrtho.left = -this.ctx.canvas.offsetWidth/2;
	this.ctx.scene.cameraOrtho.right = this.ctx.canvas.offsetWidth/2;
	this.ctx.scene.cameraOrtho.top = this.ctx.canvas.offsetHeight/2;
	this.ctx.scene.cameraOrtho.bottom = -this.ctx.canvas.offsetHeight/2;
	this.ctx.scene.cameraOrtho.updateProjectionMatrix();

	this.ctx.scene.renderer.setSize(this.ctx.canvas.offsetWidth, this.ctx.canvas.offsetHeight);
	
	this.ctx.objects.updateSprites();
	this.ctx.scene.render();
}

Bubbles.Events.prototype.onMouseDown = function (event)
{
	this.isUserInteracting = true;
	
	this.mouseDownX = event.clientX;
	this.mouseDownY = event.clientY;
}

Bubbles.Events.prototype.onMouseUp = function ()
{
	this.isUserInteracting = false;
	this.animate = false;
}

Bubbles.Events.prototype.onMouseClick = function ()
{
	if (this.intersect != null) {
		if (this.intersect.userData.events !== undefined && this.intersect.userData.events.onclick !== undefined) {
			for (var key in this.intersect.userData.events.onclick) {
				this.ctx.actions.actionTrigger(this.intersect.userData.events.onclick[key]);
			}
		}
		this.ctx.scene.render();
	}
}

Bubbles.Events.prototype.onMouseMove = function (event)
{
	this.mouse = new THREE.Vector2();
	this.mouse.x = ( event.clientX / this.ctx.canvas.offsetWidth ) * 2 - 1;
	this.mouse.y = - ( event.clientY / this.ctx.canvas.offsetHeight ) * 2 + 1;

	this.raycaster.setFromCamera(this.mouse, this.ctx.scene.cameraOrtho);
	this.intersect = this.raycaster.intersectObjects(this.ctx.scene.sceneOrtho.children);

	if (this.intersect.length>0) {
		this.intersect = this.intersect[0].object;
	} else {
		this.raycaster.setFromCamera(this.mouse, this.ctx.scene.camera);
		this.intersect = this.raycaster.intersectObjects(this.ctx.scene.scene.children);
		if (this.intersect.length>1) {
			this.intersect = this.intersect[0].object;
		} else {
			this.intersect = null;
		}
	}

	if (this.intersect !== this.lastintersect){
		if (this.intersect != null){
			//over
			if (this.intersect.userData.events !== undefined && this.intersect.userData.events.onover !== undefined) {
				for (var key in this.intersect.userData.events.onover) {
					this.ctx.actions.actionTrigger(this.intersect.userData.events.onover[key]);
				}
			}
		}
		if (this.lastintersect != null){
			//out
			if (this.lastintersect.userData.events !== undefined && this.lastintersect.userData.events.onout !== undefined) {
				for (var key in this.lastintersect.userData.events.onout) {
					this.ctx.actions.actionTrigger(this.lastintersect.userData.events.onout[key]);
				}
			}
		}
	}
	this.lastintersect = this.intersect;


	if (this.isUserInteracting === true) {
		this.mouseX = event.clientX;
		this.mouseY = event.clientY;
		if (this.animate === false) {
			this.animate = true;
			this.ctx.animations.animateLookAt();
		}
	}
}

Bubbles.Events.prototype.onMouseWheel = function (event)
{
	// WebKit
	if (event.wheelDeltaY) {
		this.ctx.scene.camera.fov -= event.wheelDeltaY * 0.05;
	// Opera / Explorer 9
	} else if (event.wheelDelta) {
		this.ctx.scene.camera.fov -= event.wheelDelta * 0.05;
	// Firefox
	} else if (event.detail) {
		this.ctx.scene.camera.fov += event.detail * 1.0;
	}
	this.ctx.scene.camera.fov = Math.max(this.ctx.scene.currentBubble.view.fov.min, Math.min(this.ctx.scene.currentBubble.view.fov.max, this.ctx.scene.camera.fov));
	this.ctx.scene.camera.updateProjectionMatrix();
	this.ctx.scene.render();
}