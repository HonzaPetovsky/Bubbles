Bubbles.Panorama = function (param)
{
	this.manager = param.manager;

	switch (param.image.type) {
		case 'cube': 
			this.cubicPanorama(param.image.data);
			break;
		case 'sphere':
			this.spherePanorama(param.image.data);
	}
}

Bubbles.Panorama.prototype.cubicPanorama = function (image)
{
	var geometry = new THREE.BoxGeometry(500, 500, 500);
	geometry.scale(-1, 1, 1);
	var bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);

	this.mesh = new THREE.Mesh(bufferGeometry, this.getSkyboxMaterial(image));
}

Bubbles.Panorama.prototype.spherePanorama = function (image)
{
	var geometry = new THREE.SphereGeometry(500, 60, 40);
	geometry.scale(-1, 1, 1);
	var bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);

	this.mesh = new THREE.Mesh(bufferGeometry, this.getSphereMaterial(image));
}

Bubbles.Panorama.prototype.getMesh = function()
{
	return this.mesh;
}

Bubbles.Panorama.prototype.getSkyboxMaterial = function (image)
{
	var loader = new THREE.CubeTextureLoader(this.manager);
	var texture = loader.load([
		image.back,
		image.front,
		image.up,
		image.down,
		image.right,
		image.left
	]);
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	var shader = THREE.ShaderLib['cube'];
	shader.uniforms['tCube'].value = texture;

	return new THREE.ShaderMaterial({
		uniforms: shader.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
	});
}

Bubbles.Panorama.prototype.getSphereMaterial = function (image)
{
	var loader = new THREE.TextureLoader(this.manager);
	var texture = loader.load(image);
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	//return new THREE.MeshBasicMaterial({map:texture});
	var shader = THREE.ShaderLib['equirect'];
	shader.uniforms['tEquirect'].value = texture;

	return new THREE.ShaderMaterial({
		uniforms: shader.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
	});
}