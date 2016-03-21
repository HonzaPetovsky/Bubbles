Bubbles.Objects = function (loadingManager)
{
	this.hotspotsMap = [];
	this.loadingManager = loadingManager;
}

Bubbles.Objects.prototype.loadHotspots = function (hotspots, scene)
{
	for (var key in hotspots) {
		var hotspot = new Bubbles.Hotspot(key, hotspots[key], this.loadingManager);

		scene.add(hotspot.hotspot);
		this.hotspotsMap.push({name: key, hotspot: hotspot});
	}
}