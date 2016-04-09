Bubbles.Animation = function (renderer)
{
	this.animationCounter = 0;

	this.lat = 0;
	this.lon = 0;

	this.deltaX = 0;
	this.deltaY = 0;

	this.camera = renderer.camera;
	this.renderer = renderer;
}

Bubbles.Animation.prototype.update = function (deltaX, deltaY)
{
	this.deltaX = deltaX;
	this.deltaY = deltaY;
}

Bubbles.Animation.prototype.start = function ()
{
	this.animationCounter += 1;
	this.run();
}

Bubbles.Animation.prototype.stop = function ()
{
	this.animationCounter -= 1;
	this.deltaX = 0;
	this.deltaY = 0;
}

Bubbles.Animation.prototype.stopAll = function ()
{
	this.animationCounter = 0;
	this.deltaX = 0;
	this.deltaY = 0;
}

Bubbles.Animation.prototype.run = function ()
{
	var animation = this;
	if (this.animationCounter > 0) {
		requestAnimationFrame(function () { animation.run(); });

		this.lon += this.deltaX*0.005;
		this.lat -= this.deltaY*0.005;

		this.lat = Math.max(-85, Math.min(85, this.lat));
		var phi = THREE.Math.degToRad(90-this.lat);
		var theta = THREE.Math.degToRad(this.lon);

		this.camera.target.x = Math.sin(phi) * Math.cos(theta);
		this.camera.target.y = Math.cos(phi);
		this.camera.target.z = Math.sin(phi) * Math.sin(theta);

		this.camera.lookAt(this.camera.target);
		this.renderer.render();
	}
}