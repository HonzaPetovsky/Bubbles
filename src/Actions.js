Bubbles.Actions = {};

Bubbles.Actions.changeBubble = function (action, data, currentBubble, scene, loadingManager, objects, actionTrigger)
{
	console.log("changeBubble", action.id);

	currentBubble = data.bubbles[action.id];

	for (key in scene.children) {
		scene.children[key].removeEventListener("click", Bubbles.ObjectListener.click);
		scene.children[key].removeEventListener("over", Bubbles.ObjectListener.over);
		scene.children[key].removeEventListener("out", Bubbles.ObjectListener.out);
		scene.children[key].removeEventListener("down", Bubbles.ObjectListener.down);
		scene.children[key].removeEventListener("up", Bubbles.ObjectListener.up);
	}
	scene.children = [];
	scene.add(new Bubbles.Panorama({ image: currentBubble.image, manager: loadingManager }).getMesh());

	objects.loadHotspots(currentBubble.hotspots, scene, actionTrigger);
}

Bubbles.Actions.setProperty = function (action, objects, scene)
{
	var obj = scene.getObjectByName(action.id);
	switch (action.property) {
		case "opacity":
			obj.material.opacity = action.value;
			break;
	}
}