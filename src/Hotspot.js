Bubbles.Hotspot = function (ctx, key, hotspot, textureLoader)
{
	this.ctx = ctx;

	this.name = key;
	this.textureLoader = textureLoader;
	this.hotspotData = hotspot;

	this.geometry = new THREE.PlaneGeometry(1, 1);
	this.distorted = this.hotspotData.distorted === true ? true : false;

	var obj = this;
	this.tex = this.textureLoader.load(this.hotspotData.url, function() {obj.update()});
	this.tex.minFilter = THREE.LinearFilter;
	this.tex.magFilter = THREE.LinearFilter;

	if (this.distorted) {
		this.material = new THREE.MeshBasicMaterial({map: this.tex, transparent: true});
		this.hotspot = new THREE.Mesh(this.geometry, this.material);
	} else {
		this.material = new THREE.SpriteMaterial({map: this.tex});
		this.hotspot = new THREE.Sprite(this.material);
	}

	this.hotspot.userData = this.hotspotData;
	this.hotspot.name = this.name;

	this.phi = THREE.Math.degToRad(90-this.hotspotData.lat);
	this.theta = THREE.Math.degToRad(this.hotspotData.lon);

	this.position = new THREE.Vector3(0, 0, 0);
	this.position.x = 100* Math.sin(this.phi) * Math.cos(this.theta);
	this.position.y = 100* Math.cos(this.phi);
	this.position.z = 100* Math.sin(this.phi) * Math.sin(this.theta);

	this.hotspot.position.set(this.position.x, this.position.y, this.position.z);
	this.hotspot.rotation.order = 'YXZ';
	this.hotspot.rotation.y = -THREE.Math.degToRad(this.hotspotData.lon+90);
	this.hotspot.rotation.x = THREE.Math.degToRad(this.hotspotData.lat);

	return this;
}

Bubbles.Hotspot.prototype.update = function ()
{
	this.imageWidth = this.hotspot.material.map.image.width;
	this.imageHeight = this.hotspot.material.map.image.height;
	this.hotspot.scale.x = this.imageWidth *0.2;
	this.hotspot.scale.y = this.imageHeight *0.2;

	this.ctx.scene.render();
}