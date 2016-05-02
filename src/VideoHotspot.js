Bubbles.VideoHotspot = function (key, hotspotData, manager, actionTrigger)
{
	var video = document.createElement('video');
	video.autoplay = false;
	video.loop = false;
	video.src = hotspotData.url;

	if (video.canPlayType('video/mp4') && hotspotData.url.mp4 != undefined) {
		video.src = hotspotData.url.mp4;
	} else if (video.canPlayType('video/ogg') && hotspotData.url.ogg != undefined) {
		video.src = hotspotData.url.ogg;
	} else if (video.canPlayType('video/webm') && hotspotData.url.webm != undefined) {
		video.src = hotspotData.url.webm;
	} else {
		console.log("error: video not supported");
	}


	var hotspot = this;
	video.onloadedmetadata = function () { hotspot.update(); }
	

	var geometry = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry(1, 1));

	var texture = new THREE.VideoTexture(video);
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	//var material = new THREE.MeshBasicMaterial({ map: texture });
	
	var mask = hotspotData.mask ? 1 : 0;
	var uniforms = {
		texture: { type: "t", value: texture },
		mask: { type: "i", value: mask }
	};
	
	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: Bubbles.ShaderLib.video.vertexShader,
		fragmentShader: Bubbles.ShaderLib.video.fragmentShader,
		transparent: true,
	});
	
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

Bubbles.VideoHotspot.prototype.update = function ()
{

	this.hotspot.scale.x = this.hotspot.userData.videoElement.videoWidth *0.2;
	if (this.hotspot.userData.mask) {
		this.hotspot.scale.y = this.hotspot.userData.videoElement.videoHeight *0.2/2;
	} else {
		this.hotspot.scale.y = this.hotspot.userData.videoElement.videoHeight *0.2;
	}
	
	//this.hotspot.material.uniforms.scale.value.x = this.hotspot.material.uniforms.texture.value.image.width *0.2;
	//this.hotspot.material.uniforms.scale.value.y = this.hotspot.material.uniforms.texture.value.image.height *0.2;
}

Bubbles.VideoHotspot.prototype.getMesh = function ()
{
	return this.hotspot;
}