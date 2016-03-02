Bubbles.Skybox = function (currentBubble, loadingManager)
{
	this.currentBubble = currentBubble;
	this.textures = [];
	this.textureLoader = new THREE.TextureLoader(loadingManager);

	this.tex = this.textureLoader.load(this.currentBubble.image.data.back);
	this.tex.minFilter = THREE.LinearFilter; this.tex.magFilter = THREE.LinearFilter;
	this.textures.push(new THREE.MeshBasicMaterial({map: this.tex}));

	this.tex = this.textureLoader.load(this.currentBubble.image.data.front);
	this.tex.minFilter = THREE.LinearFilter; this.tex.magFilter = THREE.LinearFilter;
	this.textures.push(new THREE.MeshBasicMaterial({map: this.tex}));

	this.tex = this.textureLoader.load(this.currentBubble.image.data.up);
	this.tex.minFilter = THREE.LinearFilter; this.tex.magFilter = THREE.LinearFilter;
	this.textures.push(new THREE.MeshBasicMaterial({map: this.tex}));

	this.tex = this.textureLoader.load(this.currentBubble.image.data.down);
	this.tex.minFilter = THREE.LinearFilter; this.tex.magFilter = THREE.LinearFilter;
	this.textures.push(new THREE.MeshBasicMaterial({map: this.tex}));

	this.tex = this.textureLoader.load(this.currentBubble.image.data.right);
	this.tex.minFilter = THREE.LinearFilter; this.tex.magFilter = THREE.LinearFilter;
	this.textures.push(new THREE.MeshBasicMaterial({map: this.tex}));

	this.tex = this.textureLoader.load(this.currentBubble.image.data.left);
	this.tex.minFilter = THREE.LinearFilter; this.tex.magFilter = THREE.LinearFilter;
	this.textures.push(new THREE.MeshBasicMaterial({map: this.tex}));

	return new THREE.MultiMaterial(this.textures);
}