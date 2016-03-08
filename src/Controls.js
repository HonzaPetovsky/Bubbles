Bubbles.Controls = function (ctx)
{
	this.ctx = ctx;
	this.vmove = 0;
	this.hmove = 0;
}

Bubbles.Controls.prototype.horizontalMove = function (speed)
{
	this.hmove = speed;
	this.ctx.animations.animateHV();
}

Bubbles.Controls.prototype.verticalMove = function (speed)
{
	this.vmove = speed;
	this.ctx.animations.animateHV();
}