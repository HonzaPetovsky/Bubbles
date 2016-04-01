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

	if (currentBubble.lensflare !== undefined) {
		scene.add(Bubbles.Lensflare(currentBubble.lensflare.lat, currentBubble.lensflare.lon, currentBubble.lensflare.size ,loadingManager));
	}
}

Bubbles.Actions.setProperty = function (action, scene, sceneOrtho)
{
	var obj = sceneOrtho.getObjectByName(action.id);
	if (obj == undefined) {
		obj = scene.getObjectByName(action.id);
	}
	if (obj != undefined) {
		switch (action.property) {
			case "opacity":
				obj.material.opacity = action.value;
				break;
		}
	}
}

Bubbles.Actions.toggleFullscreen = function (canvas)
{
	canvas.requestFullscreen = canvas.requestFullscreen || canvas.mozRequestFullscreen || canvas.mozRequestFullScreen || canvas.webkitRequestFullscreen;
	document.exitFullscreen = document.exitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen;

	if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
}