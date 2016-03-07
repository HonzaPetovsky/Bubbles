Bubbles = function (param)
{
	this.version = 'dev';

	this.dataUrl = param.data;
	this.target = param.target;
	
	this.canvas = document.getElementById(this.target);

	
	this.loader = new Bubbles.Loader(this);
	

	this.objects = new Bubbles.Objects(this);
	this.scene = new Bubbles.Scene(this);

	this.animations = new Bubbles.Animations(this);
	this.events = new Bubbles.Events(this);
	this.actions = new Bubbles.Actions(this);
	this.controls = new Bubbles.Controls(this);
}
