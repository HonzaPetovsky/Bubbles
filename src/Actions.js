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
		case "horizontalMove":
			this.ctx.controls.horizontalMove(action.speed);
			break;
		case "verticalMove":
			this.ctx.controls.verticalMove(action.speed);
			break;
	}
}

Bubbles.Actions.prototype.actionChangeBubble = function (id)
{
	console.log("changeBubble",id);
	this.ctx.loader.start();
	this.ctx.scene.currentBubble = this.ctx.scene.data.bubbles[id];
	
	this.ctx.scene.scene.children = this.ctx.scene.scene.children.slice(0, 1);

	this.ctx.scene.scene.children[0].material = new Bubbles.Skybox(this.ctx.scene.currentBubble, this.ctx.loader.loadingManager);

	this.ctx.objects.hotspotsMap = [];
	this.ctx.objects.loadHotspots(this.ctx.scene.currentBubble.hotspots);

	this.ctx.scene.render();
}

Bubbles.Actions.prototype.actionSetProperty = function (id, property, value)
{
	switch (property) {
		case "opacity":
			var obj = this.ctx.objects.getHotspot(id);
			if (obj !== null) {
				obj.material.opacity = value;
			}
			obj = this.ctx.objects.getSprite(id);
			if (obj !== null) {
				obj.material.opacity = value;
			}
			break;
	}
	this.ctx.scene.render();
}
