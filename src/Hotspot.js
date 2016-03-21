Bubbles.Hotspot = function (key, hotspotData, loadingManager)
{
	this.name = key;

	var hotspot = this;
	var texture = new THREE.TextureLoader(loadingManager).load(hotspotData.url, function () { hotspot.update(); });
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	var material;
	if (hotspotData.distorted) {
		var geometry = new THREE.BufferGeometry().fromGeometry(new THREE.PlaneGeometry(1, 1));
		
		var shader = THREE.ShaderLib.basic;
		shader.uniforms.map.value = texture;

		material = new THREE.ShaderMaterial({
			uniforms: shader.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			transparent: true
		});
		material.map = true;

		this.hotspot = new THREE.Mesh(geometry, material);
	} else {
		material = new THREE.SpriteMaterial({ map: texture });
		this.hotspot = new THREE.Sprite(material);
	}

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
}

Bubbles.Hotspot.prototype.update = function ()
{
	if (this.hotspot.userData.distorted) {
		this.hotspot.scale.x = this.hotspot.material.uniforms.map.value.image.width *0.2;
		this.hotspot.scale.y = this.hotspot.material.uniforms.map.value.image.height *0.2;
	} else {
		this.hotspot.scale.x = this.hotspot.material.map.image.width *0.2;
		this.hotspot.scale.y = this.hotspot.material.map.image.height *0.2;
	}
}