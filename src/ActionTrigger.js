Bubbles.ActionTrigger = function (objects, renderer, data, currentBubble, scene, sceneOrtho, loadingManager, loader, canvas)
{
	this.objects = objects;
	this.renderer = renderer;
	this.data = data;
	this.currentBubble = currentBubble;
	this.scene = scene;
	this.sceneOrtho = sceneOrtho;
	this.loadingManager = loadingManager;
	this.loader = loader;
	this.canvas = canvas;
}

Bubbles.ActionTrigger.prototype.trigger = function (action)
{
	switch (action.action) {
		case "changeBubble":
			this.loader.start();
			Bubbles.Actions.changeBubble(action, this.data, this.currentBubble, this.scene, this.loadingManager, this.objects, this);
			break;
		case "setProperty":
			Bubbles.Actions.setProperty(action, this.scene, this.sceneOrtho);
			this.renderer.render();
			break;
		case "toggleFullscreen":
			Bubbles.Actions.toggleFullscreen(this.canvas);
			break;
	}
}