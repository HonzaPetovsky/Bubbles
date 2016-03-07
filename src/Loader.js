Bubbles.Loader = function (ctx)
{
	this.ctx = ctx;
	this.loadingManager = new THREE.LoadingManager();

	var obj = this;
	this.loadingManager.onProgress = function (item, loaded, total) {obj.progress(item, loaded, total);};
	this.loadingManager.onError = function (item) {obj.progress(item);};
	this.loadingManager.onLoad = function () {obj.load();};


}

Bubbles.Loader.prototype.init = function (loader)
{
	this.image = document.createElement('div');
	this.image.style.cssText  = 'position:absolute;width:100%;height:100%;';
	this.image.style.cssText += 'background-color:'+loader.color+';';
	this.image.style.cssText += 'background-image: url('+loader.url+');background-repeat: no-repeat;background-position: center center;';
	this.ctx.canvas.appendChild(this.image);
}

Bubbles.Loader.prototype.progress = function (item, loaded, total)
{
	console.log(item, loaded, total);
	this.ctx.scene.render();
}

Bubbles.Loader.prototype.error = function (item)
{
	console.log(item, "error: loading error!");
}

Bubbles.Loader.prototype.load = function ()
{
	console.log("done");
	this.image.style.display = "none";
}

Bubbles.Loader.prototype.start = function ()
{
	this.image.style.display = "initial";
}