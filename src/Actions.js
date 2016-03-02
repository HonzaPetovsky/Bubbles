Bubbles.Actions = function (ctx)
{
	this.ctx = ctx;
}

Bubbles.Actions.prototype.actionTrigger = function (action)
{
	switch (action.action) {
		case "changeBubble":
			this.actionChangeBubble(action.id);
			break;
		case "setProperty":
			this.actionSetProperty(action.id, action.property, action.value);
			break;
	}
}

Bubbles.Actions.prototype.actionChangeBubble = function (id)
{
	console.log("changeBubble",id);
	this.ctx.scene.currentBubble = this.ctx.scene.data.bubbles[id];
	
	this.ctx.objects.hotspotsMap.clear();
	this.ctx.objects.loadHotspots(this.ctx.scene.currentBubble.hotspots);

	this.ctx.scene.scene.children = this.ctx.scene.scene.children.slice(0, 1);

	this.ctx.scene.scene.children[0].material = new Bubbles.Skybox(this.ctx.scene.currentBubble, this.ctx.loadingManager);
	this.ctx.scene.render();
}

Bubbles.Actions.prototype.actionSetProperty = function (id, property, value)
{
	switch (property) {
		case "opacity":
			if (this.ctx.objects.hotspotsMap.has(id)) {
				this.ctx.objects.hotspotsMap.get(id).hotspot.material.opacity = value;
			}
			if (this.ctx.objects.spritesMap.has(id)) {
				this.ctx.objects.spritesMap.get(id).sprite.material.opacity = value;
			}
			break;
	}
	this.ctx.scene.render();
}