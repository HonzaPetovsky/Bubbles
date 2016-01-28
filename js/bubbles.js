var canvas = null,
	camera = null,
	renderer = null,
	scene = null,

	lat = 0, lon = 0,

	isUserInteracting = false,
	animate = false,
	mouseDownX = 0, mouseX = 0, easingX = 0,
	mouseDownY = 0, mouseY = 0, easingY = 0,
	easing = 0;



function Bubbles(container, xml) 
{
	canvas = document.getElementById(container);
	init();
}

function init() 
{
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth/canvas.offsetHeight, 0.1, 1000);
	camera.target = new THREE.Vector3(1, 0, 0);
	camera.lookAt(camera.target);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
	canvas.appendChild(renderer.domElement);

	var geometry = new THREE.BoxGeometry(1, 1, 1);
	geometry.scale(-1, 1, 1);
	var material = new THREE.MeshFaceMaterial([
		new THREE.MeshBasicMaterial({color: 0xff0000}),
		new THREE.MeshBasicMaterial({color: 0x00ff00}),
		new THREE.MeshBasicMaterial({color: 0x0000ff}),
		new THREE.MeshBasicMaterial({color: 0xffff00}),
		new THREE.MeshBasicMaterial({color: 0x00ffff}),
		new THREE.MeshBasicMaterial({color: 0xff00ff})
		]);

	var cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	renderer.render(scene, camera);

	
	window.addEventListener('resize', onWindowResize);
	document.addEventListener('mousedown', onMouseDown);
	document.addEventListener('mouseup', onMouseUp);
	document.addEventListener('mouseout', onMouseUp);
	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mousewheel', onMouseWheel);
	document.addEventListener('DOMMouseScroll', onMouseWheel);
}

function onWindowResize() 
{
	camera.aspect = canvas.offsetWidth/canvas.offsetHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
	renderer.render(scene, camera);
}

function onMouseDown(event)
{
	isUserInteracting = true;
	easingX = 0;
	easingY = 0;
	easing = 0;

	mouseDownX = event.clientX;
	mouseDownY = event.clientY;
}

function onMouseUp()
{
	easingX = (mouseX-mouseDownX);
	easingY = (mouseY-mouseDownY);
	easing = 10;

	isUserInteracting = false;
	animate = false;
}

function onMouseMove(event)
{
	if (isUserInteracting === true) {

		mouseX = event.clientX;
		mouseY = event.clientY;
		if (animate === false) {
			animate = true;
			animateLookAt();
		}
	}
}

function animateLookAt()
{
	if (isUserInteracting === true || easing > 0) {
		requestAnimationFrame(animateLookAt);

		if (easing > 0) {
			lon += easingX*0.01/10*easing;
			lat -= easingY*0.01/10*easing;
			easing -= 0.5;
		} 
		else {
			lon += (mouseX-mouseDownX)*0.01;
			lat -= (mouseY-mouseDownY)*0.01;
		}


		lat = Math.max(-85, Math.min(85, lat));
		phi = THREE.Math.degToRad(90-lat);
		theta = THREE.Math.degToRad(lon);

		camera.target.x = Math.sin(phi) * Math.cos(theta);
		camera.target.y = Math.cos(phi);
		camera.target.z = Math.sin(phi) * Math.sin(theta);

		camera.lookAt(camera.target);

		renderer.render(scene, camera);
	}
}

function onMouseWheel(event)
{
	// WebKit
	if (event.wheelDeltaY) {
		camera.fov -= event.wheelDeltaY * 0.05;
	// Opera / Explorer 9
	} else if (event.wheelDelta) {
		camera.fov -= event.wheelDelta * 0.05;
	// Firefox
	} else if (event.detail) {
		camera.fov += event.detail * 1.0;
	}
	camera.updateProjectionMatrix();
	renderer.render(scene, camera);
}