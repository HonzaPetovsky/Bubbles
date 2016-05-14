Bubbles.Lensflare = function (lat, lon, size, manager)
{
	var textureLoader = new THREE.TextureLoader(this.loadingManager);
	var textureFlare0 = textureLoader.load("lensflare/lensflare0.png");
	var textureFlare2 = textureLoader.load("lensflare/lensflare2.png");
	var textureFlare3 = textureLoader.load("lensflare/lensflare3.png");
	
	var flareColor = new THREE.Color( 0xffffff );

	var lensflare = new THREE.LensFlare(textureFlare0, 700*size, 0.0, THREE.AdditiveBlending, flareColor);

	lensflare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
	lensflare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
	lensflare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
	lensflare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
	lensflare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
	lensflare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
	lensflare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);


	var phi = THREE.Math.degToRad(90-lat);
	var theta = THREE.Math.degToRad(lon);

	var position = new THREE.Vector3(0, 0, 0);
	position.x = 100* Math.sin(phi) * Math.cos(theta);
	position.y = 100* Math.cos(phi);
	position.z = 100* Math.sin(phi) * Math.sin(theta);


	lensflare.position.set(position.x, position.y, position.z);

	return lensflare;
}