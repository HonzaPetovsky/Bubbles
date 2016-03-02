Bubbles.Objects = function (ctx)
{
	this.ctx = ctx;

	this.spritesMap = new Map();
	this.hotspotsMap = new Map();

	this.textureLoader = new THREE.TextureLoader(this.ctx.loadingManager);
}

Bubbles.Objects.prototype.loadSprites = function (sprites)
{
	for (var key in sprites) {
		var sprite = new Bubbles.Sprite(this.ctx, key, sprites[key], this.textureLoader);

		this.ctx.scene.sceneOrtho.add(sprite.sprite);
		this.spritesMap.set(key, sprite);
	}
}

Bubbles.Objects.prototype.updateSprites = function ()
{
	for (var sprite in this.spritesMap.values()) {
		sprite.update();
	}
}

Bubbles.Objects.prototype.loadHotspots = function (hotspots)
{
	for (var key in hotspots) {
		var hotspot = new Bubbles.Hotspot(this.ctx, key, hotspots[key], this.textureLoader);

		this.ctx.scene.scene.add(hotspot.hotspot);
		this.hotspotsMap.set(key, hotspot);
	}
}