Bubbles.Loader = function (param)
{
	this.image = document.createElement('div');
	this.image.style.cssText  = 'position:absolute;width:100%;height:100%;z-index:1000;';
	this.image.style.cssText += 'background-color:'+param.data.color+';';
	this.image.style.cssText += 'background-image: url('+param.data.url+');background-repeat: no-repeat;background-position: center center;';
	param.canvas.appendChild(this.image);
}

Bubbles.Loader.prototype.start = function ()
{
	this.image.style.display = "initial";
}

Bubbles.Loader.prototype.hide = function ()
{
	this.image.style.display = "none";
}