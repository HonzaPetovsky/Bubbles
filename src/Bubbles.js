Bubbles = function (param)
{
	this.version = 'dev';

	this.dataUrl = param.data;
	this.target = param.target;
	this.init();
}

Bubbles.prototype.init = function ()
{
	this.canvas = document.getElementById(this.target);

	this.loadingManager = new THREE.LoadingManager();

	this.objects = new Bubbles.Objects(this);
	this.scene = new Bubbles.Scene(this);

	this.animations = new Bubbles.Animations(this);
	this.events = new Bubbles.Events(this);
	this.actions = new Bubbles.Actions(this);


	var obj = this;
	this.loadingManager.onProgress = function (item, loaded, total) {
		console.log(item, loaded, total);
		obj.scene.render();
	};
	this.loadingManager.onError = function (item) {
		console.log(item, "error: loading error!");
	};
}