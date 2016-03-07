Bubbles.Objects = function (ctx)
{
	this.ctx = ctx;

	this.spritesMap = [];
	this.hotspotsMap = [];

	this.textureLoader = new THREE.TextureLoader(this.ctx.loader.loadingManager);
}

Bubbles.Objects.prototype.loadSprites = function (sprites)
{
	for (var key in sprites) {
		var sprite = new Bubbles.Sprite(this.ctx, key, sprites[key], this.textureLoader);

		this.ctx.scene.sceneOrtho.add(sprite.sprite);
		this.spritesMap.push({name: key, sprite: sprite});
	}
}

Bubbles.Objects.prototype.updateSprites = function ()
{
	console.log(this.spritesMap);
	for (var key in this.spritesMap) {
		this.spritesMap[key].sprite.update()
	}
}

Bubbles.Objects.prototype.getSprite = function (id)
{
	for (var key in this.spritesMap) {
		if (this.spritesMap[key].name == id){
			return this.spritesMap[key].sprite;
		}
	}
	return null;
}

Bubbles.Objects.prototype.loadHotspots = function (hotspots)
{
	for (var key in hotspots) {
		var hotspot = new Bubbles.Hotspot(this.ctx, key, hotspots[key], this.textureLoader).hotspot;

		this.ctx.scene.scene.add(hotspot)
		this.hotspotsMap.push({name: key, hotspot: hotspot});
	}
}

Bubbles.Objects.prototype.getHotspot = function (id)
{
	for (var key in this.hotspotsMap) {
		if (this.hotspotsMap[key].name == id){
			return this.hotspotsMap[key].hotspot;
		}
	}
	return null;
}