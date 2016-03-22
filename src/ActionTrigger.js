Bubbles.ActionTrigger = function (objects, renderer, data, currentBubble, scene, loadingManager, loader)
{
	this.objects = objects;
	this.renderer = renderer;
	this.data = data;
	this.currentBubble = currentBubble;
	this.scene = scene;
	this.loadingManager = loadingManager;
	this.loader = loader;
}

Bubbles.ActionTrigger.prototype.trigger = function (action)
{
	switch (action.action) {
		case "changeBubble":
			this.loader.start();
			Bubbles.Actions.changeBubble(action, this.data, this.currentBubble, this.scene, this.loadingManager, this.objects, this);
			break;
		case "setProperty":
			Bubbles.Actions.setProperty(action, this.objects, this.scene);
			this.renderer.render();
			break;
	}

}