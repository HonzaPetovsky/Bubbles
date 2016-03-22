Bubbles.Objects = function (loadingManager)
{
	this.loadingManager = loadingManager;
}

Bubbles.Objects.prototype.loadHotspots = function (hotspots, scene, actionTrigger)
{
	for (var key in hotspots) {
		var hotspot = new Bubbles.Hotspot(key, hotspots[key], this.loadingManager, actionTrigger);

		scene.add(hotspot.hotspot);
	}
}