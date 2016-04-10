Bubbles.Hotspot = function (key, hotspotData, manager, actionTrigger)
{
	var hotspot = this;
	var texture = new THREE.TextureLoader(manager).load(hotspotData.url, function () { hotspot.update(); });
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	var geometry = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry(1, 1));

	var uniforms = {
		texture: { type: "t", value: texture },
		opacity: { type: "f", value: 1.0 },
		scale: { type: "v3", value: new THREE.Vector3() }
	};

	if (hotspotData.distorted) {
		uniforms.distorted = { type: "i", value: 1 }
	} else {
		uniforms.distorted = { type: "i", value: 0 }
	}

	

	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: Bubbles.ShaderLib.basicPanoObject.vertexShader,
		fragmentShader: Bubbles.ShaderLib.basicPanoObject.fragmentShader,
		transparent: true,
	});

	this.hotspot = new THREE.Mesh(geometry, material);
	

	this.hotspot.userData = hotspotData;
	this.hotspot.name = key;

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

Bubbles.Hotspot.prototype.update = function ()
{
	this.hotspot.scale.x = this.hotspot.material.uniforms.texture.value.image.width *0.2;
	this.hotspot.scale.y = this.hotspot.material.uniforms.texture.value.image.height *0.2;
	this.hotspot.material.uniforms.scale.value.x = this.hotspot.material.uniforms.texture.value.image.width *0.2;
	this.hotspot.material.uniforms.scale.value.y = this.hotspot.material.uniforms.texture.value.image.height *0.2;
}

Bubbles.Hotspot.prototype.getMesh = function ()
{
	return this.hotspot;
}