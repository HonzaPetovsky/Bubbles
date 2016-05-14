var app = angular.module("latlon", []);
app.directive("latlon", function () {
	return {
		scope: {
			target: '=',
			preview: '='
		},
		templateUrl: 'editor/modules/latlonTpl.html',
		controller: function ($scope, $element) {

			$scope.element = $($element[0].children[2]);

			$scope.latOptions = {
				floor: -85,
				ceil: 85,
				onChange: function () {
					$scope.target.lat = $scope.lat;
					updateCamera();
				}
			};
			
			$scope.lonOptions = {
				floor: 0,
				ceil: 359,
				onChange: function () {
					$scope.target.lon = $scope.lon;
					updateCamera();
				}
			};
			
			function updateCamera () {
				var phi = THREE.Math.degToRad(90-$scope.lat);
				var theta = THREE.Math.degToRad($scope.lon);

				$scope.camera.target.x = Math.sin(phi) * Math.cos(theta);
				$scope.camera.target.y = Math.cos(phi);
				$scope.camera.target.z = Math.sin(phi) * Math.sin(theta);

				$scope.camera.lookAt($scope.camera.target);
				$scope.renderer.render($scope.scene, $scope.camera);
			}

			$scope.set = function () {
				$scope.lat = $scope.target.lat;
				$scope.lon = $scope.target.lon;

				$scope.element.modal('show');
				$scope.element.on('shown.bs.modal', function() {
					$scope.$broadcast('rzSliderForceRender');

					
					var canvas = $scope.element.find(".latlonCanvas")[0];
					$scope.scene = new THREE.Scene();
					$scope.camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth/canvas.offsetHeight, 0.1, 1000);
					$scope.camera.target = new THREE.Vector3(1, 0, 0);

					var phi = THREE.Math.degToRad(90-$scope.lat);
					var theta = THREE.Math.degToRad($scope.lon);

					$scope.camera.target.x = Math.sin(phi) * Math.cos(theta);
					$scope.camera.target.y = Math.cos(phi);
					$scope.camera.target.z = Math.sin(phi) * Math.sin(theta);

					$scope.camera.lookAt($scope.camera.target);

					$scope.renderer = new THREE.WebGLRenderer({ canvas: canvas });
					$scope.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
					$scope.renderer.autoClear = false;

					if ($scope.preview.type == 'cube') {
						
						var geometry = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry(500, 500, 500));
						geometry.scale(-1, 1, 1);
						var loader = new THREE.CubeTextureLoader();
						var texture = loader.load([
							$scope.preview.data.back,
							$scope.preview.data.front,
							$scope.preview.data.up,
							$scope.preview.data.down,
							$scope.preview.data.right,
							$scope.preview.data.left
						], function () {
							$scope.renderer.render($scope.scene, $scope.camera)
						});
						texture.minFilter = THREE.LinearFilter;

						var material = new THREE.ShaderMaterial({
							uniforms: {
								"tCube": { type: "t", value: texture },
								"tFlip": { type: "f", value: - 1 }
							},
							vertexShader: THREE.ShaderLib.cube.vertexShader,
							fragmentShader: THREE.ShaderLib.cube.fragmentShader,
						});
						
					} else {
						
						var geometry = new THREE.BufferGeometry().fromGeometry(new THREE.SphereGeometry(500, 60, 40));
						geometry.scale(-1, 1, 1);
						
						var loader = new THREE.TextureLoader(this.manager);
						var texture = loader.load($scope.preview.data, function () {
							$scope.renderer.render($scope.scene, $scope.camera)
						});
						texture.minFilter = THREE.LinearFilter;

						var material = new THREE.ShaderMaterial({
							uniforms: {
								"texture": { type: "t", value: texture },
							},
							vertexShader: [
								"varying vec2 vUv;",
								"void main() {",
									"vUv = uv;",
									"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
								"}"
							].join( "\n" ),
							fragmentShader: [
								"uniform sampler2D texture;",
								"varying vec2 vUv;",
								"void main() {",
									"vec4 texel = texture2D( texture, vUv );",
									"gl_FragColor = texel;",
								"}"
							].join( "\n" )	
						});
					}

					var mesh = new THREE.Mesh(geometry, material);

					$scope.scene.add(mesh);
					$scope.renderer.render($scope.scene, $scope.camera);
					
					
					
				})
			}

			$scope.close = function () {
				$scope.element.modal('hide');
			}
		}
	};
});