Bubbles.Animations = function (ctx)
{
	this.ctx = ctx;
}

Bubbles.Animations.prototype.animateLookAt = function ()
{
	if (this.ctx.events.isUserInteracting === true) {
		var obj = this;
		requestAnimationFrame(function() {obj.animateLookAt()});

		this.ctx.scene.lon += (this.ctx.events.mouseX-this.ctx.events.mouseDownX)*0.00015*this.ctx.scene.camera.fov;
		this.ctx.scene.lat -= (this.ctx.events.mouseY-this.ctx.events.mouseDownY)*0.00015*this.ctx.scene.camera.fov;
		
		this.ctx.scene.lat = Math.max(-85, Math.min(85, this.ctx.scene.lat));
		
		this.phi = THREE.Math.degToRad(90-this.ctx.scene.lat);
		this.theta = THREE.Math.degToRad(this.ctx.scene.lon);

		this.ctx.scene.camera.target.x = Math.sin(this.phi) * Math.cos(this.theta);
		this.ctx.scene.camera.target.y = Math.cos(this.phi);
		this.ctx.scene.camera.target.z = Math.sin(this.phi) * Math.sin(this.theta);

		this.ctx.scene.camera.lookAt(this.ctx.scene.camera.target);

		this.ctx.scene.render();
	}
}