Bubbles.Sprite = function (ctx, key, sprite, textureLoader)
{
	this.ctx = ctx;

	this.name = key;
	this.textureLoader = textureLoader;
	this.spriteData = sprite;
	
	var obj = this;
	this.tex = this.textureLoader.load(this.spriteData.url, function() {obj.update()});
	this.tex.minFilter = THREE.LinearFilter;
	this.tex.magFilter = THREE.LinearFilter;

	this.material = new THREE.SpriteMaterial({map: this.tex});
	this.sprite = new THREE.Sprite(this.material);

	this.sprite.userData = this.spriteData;
	this.sprite.name = this.name;

	this.sprite.position.set(this.spriteData.position.x, this.spriteData.position.y, this.spriteData.position.zorder);

	return this;
}

Bubbles.Sprite.prototype.update = function ()
{
	this.imageWidth = this.sprite.material.map.image.width;
	this.imageHeight = this.sprite.material.map.image.height;

	this.sprite.scale.set(this.imageWidth, this.imageHeight, 1);

	switch (this.spriteData.align) {
		case 'left':
			this.sprite.position.set(-this.ctx.canvas.offsetWidth/2+this.imageWidth/2+this.spriteData.position.x, this.sprite.position.y, this.sprite.position.z);
			break;
		case 'right':
			this.sprite.position.set(this.ctx.canvas.offsetWidth/2-this.imageWidth/2-this.spriteData.position.x, this.sprite.position.y, this.sprite.position.z);
			break;
		case 'top':
			this.sprite.position.set(this.sprite.position.x, this.ctx.canvas.offsetHeight/2-this.imageHeight/2-this.spriteData.position.y, this.sprite.position.z);
			break;
		case 'bottom':
			this.sprite.position.set(this.sprite.position.x, -this.ctx.canvas.offsetHeight/2+this.imageHeight/2+this.spriteData.position.y, this.sprite.position.z);
			break;
		case 'lefttop':
		case 'topleft':
			this.sprite.position.set(-this.ctx.canvas.offsetWidth/2+this.imageWidth/2+this.spriteData.position.x, this.ctx.canvas.offsetHeight/2-this.imageHeight/2-this.spriteData.position.y, this.sprite.position.z);
			break;
		case 'leftbottom':
		case 'bottomleft':
			this.sprite.position.set(-this.ctx.canvas.offsetWidth/2+this.imageWidth/2+this.spriteData.position.x, -this.ctx.canvas.offsetHeight/2+this.imageHeight/2+this.spriteData.position.y, this.sprite.position.z);
			break;
		case 'righttop':
		case 'topright':
			this.sprite.position.set(this.ctx.canvas.offsetWidth/2-this.imageWidth/2-this.spriteData.position.x, this.ctx.canvas.offsetHeight/2-this.imageHeight/2-this.spriteData.position.y, this.sprite.position.z);
			break;
		case 'rightbottom':
		case 'bottomright':
			this.sprite.position.set(this.ctx.canvas.offsetWidth/2-this.imageWidth/2-this.spriteData.position.x, -this.ctx.canvas.offsetHeight/2+this.imageHeight/2+this.spriteData.position.y, this.sprite.position.z);
			break;
	}
	this.ctx.scene.render();
}