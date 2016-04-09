Bubbles.VideoHotspot = function (key, hotspotData, manager, actionTrigger)
{
	var video = document.createElement('video');
	video.width = hotspotData.width;
	video.height = hotspotData.height;
	video.autoplay = false;
	video.loop = true;
	video.src = hotspotData.url;


	var geometry = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry(160, 90));

	var texture = new THREE.VideoTexture(video);
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	var material = new THREE.MeshBasicMaterial({ map: texture });
	this.hotspot = new THREE.Mesh(geometry, material);

	this.hotspot.name = key;
	this.hotspot.userData = hotspotData;
	this.hotspot.userData.videoElement = video;

	var phi = THREE.Math.degToRad(90-hotspotData.lat);
	var theta = THREE.Math.degToRad(hotspotData.lon);

	var position = new THREE.Vector3(0, 0, 0);
	position.x = 100* Math.sin(phi) * Math.cos(theta);
	position.y = 100* Math.cos(phi);
	position.z = 100* Math.sin(phi) * Math.sin(theta);

	this.hotspot.position.set(position.x, position.y, position.z);
	this.hotspot.rotation.order = 'YXZ';
	this.hotspot.rotation.y = -THREE.Math.degToRad(hotspotData.lon+90);
	this.hotspot.rotation.x = THREE.Math.degToRad(hotspotData.lat);

	this.hotspot.userData.actionTrigger = actionTrigger;
	if (hotspotData.events !== undefined) {
		if (hotspotData.events.onclick !== undefined) {
			this.hotspot.addEventListener("click", Bubbles.ObjectListener.click);
		}
		if (hotspotData.events.onover !== undefined) {
			this.hotspot.addEventListener("over", Bubbles.ObjectListener.over);
		}
		if (hotspotData.events.onout !== undefined) {
			this.hotspot.addEventListener("out", Bubbles.ObjectListener.out);
		}
		if (hotspotData.events.ondown !== undefined) {
			this.hotspot.addEventListener("down", Bubbles.ObjectListener.down);
		}
		if (hotspotData.events.onup !== undefined) {
			this.hotspot.addEventListener("up", Bubbles.ObjectListener.up);
		}
	}
}

Bubbles.VideoHotspot.prototype.getMesh = function ()
{
	return this.hotspot;
}