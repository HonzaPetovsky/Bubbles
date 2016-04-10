Bubbles.Sprite = function (key, spriteData, manager, actionTrigger, canvas)
{
	this.canvas = canvas;

	var sprite = this;
	var texture = new THREE.TextureLoader(manager).load(spriteData.url, function () { sprite.update(); });
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	var geometry = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry(1, 1));
	
	var material = new THREE.ShaderMaterial({
		uniforms: {
			texture: { type: "t", value: texture },
			opacity: { type: "f", value: 1.0 },
			scale: { type: "v3", value: new THREE.Vector3() },
			distorted: { type: "i", value: 0 },
		},
		vertexShader: Bubbles.ShaderLib.basicPanoObject.vertexShader,
		fragmentShader: Bubbles.ShaderLib.basicPanoObject.fragmentShader,
		transparent: true,
	});

	this.sprite = new THREE.Mesh(geometry, material);

	this.sprite.userData = spriteData;
	this.sprite.name = key;

	this.sprite.position.set(spriteData.position.x, spriteData.position.y, spriteData.position.zorder);

	this.sprite.userData.actionTrigger = actionTrigger;
	if (spriteData.events !== undefined) {
		if (spriteData.events.onclick !== undefined) {
			this.sprite.addEventListener("click", Bubbles.ObjectListener.click);
		}
		if (spriteData.events.onover !== undefined) {
			this.sprite.addEventListener("over", Bubbles.ObjectListener.over);
		}
		if (spriteData.events.onout !== undefined) {
			this.sprite.addEventListener("out", Bubbles.ObjectListener.out);
		}
		if (spriteData.events.ondown !== undefined) {
			this.sprite.addEventListener("down", Bubbles.ObjectListener.down);
		}
		if (spriteData.events.onup !== undefined) {
			this.sprite.addEventListener("up", Bubbles.ObjectListener.up);
		}
	}
}

Bubbles.Sprite.prototype.update = function ()
{
	Bubbles.Objects.updateSprite(this.sprite, this.canvas);
}

Bubbles.Sprite.prototype.getMesh = function ()
{
	return this.sprite;
}