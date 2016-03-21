Bubbles.Animation = function (camera, renderer)
{
	this.animate = false;
	this.lat = 0;
	this.lon = 0;

	this.deltaX = 0;
	this.deltaY = 0;

	this.camera = camera;
	this.renderer = renderer;
}

Bubbles.Animation.prototype.update = function (deltaX, deltaY)
{
	this.deltaX = deltaX;
	this.deltaY = deltaY;
}

Bubbles.Animation.prototype.start = function ()
{
	this.animate = true;
	this.run();
}

Bubbles.Animation.prototype.stop = function ()
{
	this.animate = false;
	this.deltaX = 0;
	this.deltaY = 0;
}

Bubbles.Animation.prototype.run = function ()
{
	var animation = this;
	if (this.animate) {
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