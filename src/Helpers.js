Bubbles.PerspectiveCamera = function (fov, aspect, near, far)
{
	var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.target = new THREE.Vector3(1, 0, 0);
	camera.lookAt(camera.target);

	return camera;
}

Bubbles.OrthographicCamera = function (left, right, top, bottom, near, far)
{
	var camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
	camera.position.z = 10;

	return camera;
}