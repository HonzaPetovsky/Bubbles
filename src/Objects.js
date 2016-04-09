Bubbles.Objects = function (loadingManager)
{
	this.loadingManager = loadingManager;
}

Bubbles.Objects.prototype.loadHotspots = function (hotspots, scene, actionTrigger)
{
	for (var key in hotspots) {
		
		var hotspot;
		switch (hotspots[key].type) {
			case "image":
				hotspot = new Bubbles.Hotspot(key, hotspots[key], this.loadingManager, actionTrigger);
				break;
			case "video":
				hotspot = new Bubbles.VideoHotspot(key, hotspots[key], this.loadingManager, actionTrigger);
				break;
		}

		scene.add(hotspot.getMesh());
	}
}

Bubbles.Objects.prototype.loadUI = function (ui, scene, actionTrigger, canvas)
{
	for (var key in ui) {
		var layer = new Bubbles.Sprite(key, ui[key], this.loadingManager, actionTrigger, canvas);

		scene.add(layer.getMesh());
	}
}

Bubbles.Objects.updateSprite = function (sprite, canvas)
{
	var imageWidth = sprite.material.map.image.width;
	var imageHeight = sprite.material.map.image.height;

	sprite.scale.set(imageWidth, imageHeight, 1);

	switch (sprite.userData.align) {
		case 'left':
			sprite.position.set(canvas.offsetWidth/2+imageWidth/2+sprite.userData.position.x, sprite.position.y, sprite.position.z);
			break;
		case 'right':
			sprite.position.set(canvas.offsetWidth/2-imageWidth/2-sprite.userData.position.x, sprite.position.y, sprite.position.z);
			break;
		case 'top':
			sprite.position.set(sprite.position.x, canvas.offsetHeight/2-imageHeight/2-sprite.userData.position.y, sprite.position.z);
			break;
		case 'bottom':
			sprite.position.set(sprite.position.x, -canvas.offsetHeight/2+imageHeight/2+sprite.userData.position.y, sprite.position.z);
			break;
		case 'lefttop':
		case 'topleft':
			sprite.position.set(-canvas.offsetWidth/2+imageWidth/2+sprite.userData.position.x, canvas.offsetHeight/2-imageHeight/2-sprite.userData.position.y, sprite.position.z);
			break;
		case 'leftbottom':
		case 'bottomleft':
			sprite.position.set(-canvas.offsetWidth/2+imageWidth/2+sprite.userData.position.x, -canvas.offsetHeight/2+imageHeight/2+sprite.userData.position.y, sprite.position.z);
			break;
		case 'righttop':
		case 'topright':
			sprite.position.set(canvas.offsetWidth/2-imageWidth/2-sprite.userData.position.x, canvas.offsetHeight/2-imageHeight/2-sprite.userData.position.y, sprite.position.z);
			break;
		case 'rightbottom':
		case 'bottomright':
			sprite.position.set(canvas.offsetWidth/2-imageWidth/2-sprite.userData.position.x, -canvas.offsetHeight/2+imageHeight/2+sprite.userData.position.y, sprite.position.z);
			break;
	}
}