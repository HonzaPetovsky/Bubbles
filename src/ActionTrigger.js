Bubbles.ActionTrigger = function (objects, renderer, data, currentBubble, loadingManager, loader, canvas, animation)
{
	this.objects = objects;
	this.renderer = renderer;
	this.data = data;
	this.currentBubble = currentBubble;
	this.scene = renderer.scene;
	this.sceneOrtho = renderer.sceneOrtho;
	this.loadingManager = loadingManager;
	this.loader = loader;
	this.canvas = canvas;
	this.animation = animation;
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
		case "toggleVideo":
			Bubbles.Actions.toggleVideo(action, this.scene, this.animation);
			break;

		default:
			console.log("unknown action", action.action);
			break;
	}
}