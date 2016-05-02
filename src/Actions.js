Bubbles.Actions = {};

Bubbles.Actions.changeBubble = function (action, data, currentBubble, scene, loadingManager, objects, actionTrigger, animation, loader)
{
	console.log("changeBubble", action.id);
	currentBubble = data.bubbles[action.id];

	animation.lat = currentBubble.view.lat;
	animation.lon = currentBubble.view.lon;
	animation.start();
	animation.run();
	animation.stopAll();

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

	if (currentBubble.image.type == "video") {
		animation.start();
		loader.hide();
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
				obj.material.uniforms.opacity.value = action.value;
				break;
			case "visible":
				obj.visible = action.value;
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

Bubbles.Actions.toggleVideo = function (action, scene, animation)
{
	var video = scene.getObjectByName(action.id).userData.videoElement;
	if (video.paused) {
		animation.start();
		video.play();
	} else {
		video.pause();
		animation.stop();
	}
}

Bubbles.Actions.startGlass = function (action, animation, canvas)
{
	console.log("glass");
	canvas.requestFullscreen = canvas.requestFullscreen || canvas.mozRequestFullscreen || canvas.mozRequestFullScreen || canvas.webkitRequestFullscreen;
	canvas.requestFullscreen();
	animation.startGlass();
}