var app = angular.module("bubblesEditor", ['Controllers', 'colorpicker.module', 'rzModule']);

app.run(['$rootScope', '$http', '$window', function($rootScope, $http, $window) {

	var url = location.pathname;
	var filename = url.substring(url.lastIndexOf('/')+1, url.indexOf('.'));
	$rootScope.dataFolder = filename;
	$rootScope.data = [];
	$rootScope.target = null;

	$http.get(filename+".json", {responseType:"text"}).then(function(res){
		$rootScope.data = res.data;
	});

	$rootScope.saveJSON = function () {
		console.log($rootScope.data);
		$rootScope.saveArea = angular.toJson($rootScope.data, true);
		$('#saveModal').modal('show');
	}

	$rootScope.save = function () {
		console.log($rootScope.dataFolder);
		$http.post("bubbles/editor/save.php",{
			'file':$rootScope.dataFolder,
			'data':angular.toJson($rootScope.data, true)
		});
		$('#saveModal').modal('hide');
	}


	$rootScope.refreshPage = function () {
		$window.location.reload();
	};

	$rootScope.closeAll = function () {
		$('#saveModal').modal('hide');
		$rootScope.$broadcast("CloseAll",{});
	}

}]);
var Controllers = angular.module('Controllers', []);



Controllers.controller("editorController", function($rootScope, $scope) {

	$scope.imageTypes = ["cube", "sphere"];
	$scope.undefinedTypes = {
		"sphere": "undefined",
		"cube": {
			"back": "undefined",
			"down": "undefined",
			"front": "undefined",
			"left": "undefined",
			"right": "undefined",
			"up": "undefined"
		}
	};

	$scope.actions = ["changeBubble", "setProperty", "toggleFullscreen", "toggleVideo"];
	$scope.actionValues = {
		"changeBubble": {
			"action": "changeBubble",
			"id": "undefined"
		},
		"setProperty": {
			"action": "setProperty",
			"id": "undefined",
			"property": "undefined",
			"value": "undefined"
		},
		"toggleFullscreen": {
			"action": "toggleFullscreen"
		},
		"toggleVideo": {
			"action": "toggleVideo",
			"id": "undefined"
		}
	}

	$scope.newValues = {
		"hud": {
			"url": "undefined",
			"align": "center",
			"position": {
				"x": 0,
				"y": 0,
				"zorder": 0
			},
			"events": {
				"onclick": [],
				"onover": [],
				"onout": [],
				"ondown": [],
				"onup": []
			}
		},
		"bubble": {
			"image": {
				"type": "sphere",
				"data": "undefined"
			},
			"hotspots": {}
		},
		"hotspot": {
			"type": "image",
			"url": "undefined",
			"position": {
				"lat": 0,
				"lon": 0,
				"distorted": true
			},
			"events": {}
		}
	}

	$scope.alignTypes = ["center", "left", "top", "bottom", "right", "topleft", "topright", "bottomleft", "bottomright"];
	$scope.hotspotTypes = ["image", "video"];

	$scope.remove = function (target) {
		eval("delete $rootScope."+target);
	}
	$scope.removeEvent = function (target, index) {
		eval("$rootScope."+target+".splice(index,1)");
	}
	$scope.addEvent = function (target, action) {
		eval("$rootScope."+target+".push($scope.actionValues[action])");
	}

	$scope.addLensflare = function (key) {
		$rootScope.data.bubbles[key].lensflare = {"lat":0,"lon":0,"size":1};
	}

	$scope.newHud = function () {
		if ($scope.hudModel != undefined && $scope.hudModel != "" && !($scope.hudModel in $rootScope.data.hud)) {

			$rootScope.data.hud[$scope.hudModel] = $scope.newValues.hud;
			$scope.hudModel = undefined;
		}
	}

	$scope.newBubble = function () {
		if ($scope.bubbleModel != undefined && $scope.bubbleModel != "" && !($scope.bubbleModel in $rootScope.data.bubbles)) {

			$rootScope.data.bubbles[$scope.bubbleModel] = $scope.newValues.bubble;
			$scope.bubbleModel = undefined;
		}
	}

	$scope.hotspotModel = [];
	$scope.newHotspot = function (key) {
		if ($scope.hotspotModel[key] != undefined && $scope.hotspotModel[key] != "" && !($scope.hotspotModel[key] in $rootScope.data.bubbles[key].hotspots)) {

			$rootScope.data.bubbles[key].hotspots[$scope.hotspotModel[key]] = $scope.newValues.hotspot;
			$scope.hotspotModel[key] = undefined;
		}
	}
	
	$scope.collapse = [];
	$scope.collapse_down = function () {
		for (key in $scope.collapse) {
			$scope.collapse[key] = true;
		}
	}
	$scope.collapse_up = function () {
		for (key in $scope.collapse) {
			$scope.collapse[key] = false;
		}
	}
});

Controllers.controller("filesController", function($rootScope, $scope, $http) {

	$scope.content = [];
	$scope.files = [];
	$scope.folders = [];
	$scope.currentFolder = $scope.content;
	$scope.breadcrumbs = [$rootScope.dataFolder];

	$rootScope.selectFile = function (where) {
		$rootScope.closeAll();
		$http.get("bubbles/editor/files.php?dir="+$rootScope.dataFolder).then(function(res){
			$scope.content = res.data;
			$scope.currentFolder = $scope.content;
			$rootScope.target = where;
			setFolder($scope.content);
		});
		$('#filesModal').modal('show');
	}

	$scope.select = function (file) {
		eval("$rootScope."+$rootScope.target+" = $scope.breadcrumbs.join('/')+'/'+file");
		$('#filesModal').modal('hide');
	}

	$scope.changeFolder = function (folder) {
		$scope.currentFolder = $scope.currentFolder[folder];
		$scope.breadcrumbs.push(folder);
		setFolder();
	}

	$scope.breadcrumbsChange = function (index) {
		var level = 0;
		var crumbs = $scope.breadcrumbs;
		$scope.breadcrumbs = [$rootScope.dataFolder];
		$scope.currentFolder = $scope.content;
		setFolder();
		while (level != index) {
			level += 1;
			$scope.breadcrumbs.push(crumbs[level]);
			$scope.currentFolder = $scope.currentFolder[crumbs[level]];
			setFolder();
		}
	}

	$scope.close = function () {
		$rootScope.target = null;
		$scope.currentFolder = $scope.content;
		$scope.breadcrumbs = [$rootScope.dataFolder];
		$('#filesModal').modal('hide');
	}

	$rootScope.$on("CloseAll", function () {
		$scope.close();
	})

	function setFolder () {
		$scope.folders = [];
		$scope.files = [];
		for (key in $scope.currentFolder) {
			if (typeof($scope.currentFolder[key]) != 'string') {
				$scope.folders.push(key);
			} else {
				$scope.files.push($scope.currentFolder[key]);
			}
		}
	}
});






Controllers.controller("sliderController", function($rootScope, $scope) {

	$scope.sizeOptions = {};
	
	$rootScope.setSize = function (where, min, max, multi, round, def_value) {
		$rootScope.closeAll();

		
		$rootScope.target = where;
		$scope.sizeOptions.floor = min;
		$scope.sizeOptions.ceil = max;

		$scope.sizeOptions.translate = function (value) {
			return Math.round(value*multi*round)/round;
		};
		$scope.sizeOptions.onChange = function () {
			eval("$rootScope."+$rootScope.target+" = Math.round($scope.size*multi*round)/round");
		};

		$scope.size = def_value;
		
		$('#sliderModal').modal('show');
		$('#sliderModal').on('shown.bs.modal', function() {
			$scope.$broadcast('rzSliderForceRender');
		})
	}

	$scope.close = function () {
		$rootScope.target = null;
		$('#sliderModal').modal('hide');
	}

	$rootScope.$on("CloseAll", function () {
		$scope.close();
	})
});

Controllers.controller("numberController", function($rootScope, $scope) {

	$scope.number = 0;

	$rootScope.setNumber = function (where, min, max, def_value) {
		$rootScope.closeAll();

		$rootScope.target = where;
		$scope.number = def_value;
		$scope.min = min;
		$scope.max = max;

		$('#numberModal').modal('show');
	}

	$scope.change = function () {
		if ($scope.number == null) {
			$scope.number = 0;
		}
		eval("$rootScope."+$rootScope.target+" = $scope.number");
	}

	$scope.close = function () {
		$rootScope.target = null;
		$scope.min = null;
		$scope.max = null;
		$('#numberModal').modal('hide');
	}

	$rootScope.$on("CloseAll", function () {
		$scope.close();
	})
});


Controllers.controller("eventEditorController", function($rootScope, $scope) {


	$scope.propertyTypes = ["opacity"];
	$scope.sizeOptionsSmall = {
		floor:  0,
		ceil: 10,
		translate: function (value) {
			return Math.round(value*0.1*10)/10;
		},
		onChange: function () {
			eval("$rootScope."+$rootScope.target+".value = Math.round($scope.valueSmall)/10");
		}
	};

	$scope.showItem = {
		"changeBubble": ["id_bubbles"],
		"setProperty": ["id_objects", "property", "valueSmall"],
		"toggleFullscreen": ["noparam"],
		"toggleVideo": ["id_objects"]
	}
	$scope.selectedItem = null;
		
	$scope.show = function (id) {
		if ($scope.selectedItem) {
			return ($scope.showItem[$scope.selectedItem].indexOf(id) != -1);
		}
		return false;
	}	

	$rootScope.editEvent = function (target) {
		$rootScope.closeAll();

		$rootScope.target = target;

		var targetData = null;
		eval("targetData = $rootScope."+$rootScope.target);
		$scope.selectedItem = targetData.action;
		switch ($scope.selectedItem) {
			case "changeBubble":
				$scope.id_bubbles = targetData.id;
				break;
			case "setProperty":
				$scope.id_objects = targetData.id;
				$scope.property = targetData.property;
				$scope.valueSmall = targetData.value*10;
				break;
			case "toggleVideo":
				$scope.id_objects = targetData.id;
				break;

		}

		
		$('#eventModal').modal('show');
		$('#eventModal').on('shown.bs.modal', function() {
			$scope.$broadcast('rzSliderForceRender');
		})
		
	}

	$scope.change_id_bubbles = function (id) {
		eval("$rootScope."+$rootScope.target+".id = id");
		$scope.id_bubbles = id;
	}
	$scope.change_id_objects = function (id) {
		eval("$rootScope."+$rootScope.target+".id = id");
		$scope.id_objects = id;
	}
	$scope.change_property = function (property) {
		eval("$rootScope."+$rootScope.target+".property = property");
		$scope.property = property;
	}

	$scope.getIds = function () {
		var ids = [];
		for (bubble in $rootScope.data.bubbles) {
			for (key in $rootScope.data.bubbles[bubble].hotspots) {
				ids.push(key);
			}
		}
		for (key in $rootScope.data.hud) {
			ids.push(key);
		}
		return ids;
	}	

	$scope.close = function () {
		$rootScope.target = null;
		$('#eventModal').modal('hide');
	}

	$rootScope.$on("CloseAll", function () {
		$scope.close();
	})
});

Controllers.controller("latlonController", function($rootScope, $scope) {

	$scope.lat = 0;
	$scope.lon = 0;

	$scope.latOptions = {
		floor: -85,
		ceil: 85,
		onChange: function () {
			eval("$rootScope."+$rootScope.target+".lat = $scope.lat");

			var phi = THREE.Math.degToRad(90-$scope.lat);
			var theta = THREE.Math.degToRad($scope.lon);

			$scope.camera.target.x = Math.sin(phi) * Math.cos(theta);
			$scope.camera.target.y = Math.cos(phi);
			$scope.camera.target.z = Math.sin(phi) * Math.sin(theta);

			$scope.camera.lookAt($scope.camera.target);
			$scope.renderer.render($scope.scene, $scope.camera);
		}
	};

	$scope.lonOptions = {
		floor:  0,
		ceil: 359,
		onChange: function () {
			eval("$rootScope."+$rootScope.target+".lon = $scope.lon");

			var phi = THREE.Math.degToRad(90-$scope.lat);
			var theta = THREE.Math.degToRad($scope.lon);

			$scope.camera.target.x = Math.sin(phi) * Math.cos(theta);
			$scope.camera.target.y = Math.cos(phi);
			$scope.camera.target.z = Math.sin(phi) * Math.sin(theta);

			$scope.camera.lookAt($scope.camera.target);
			$scope.renderer.render($scope.scene, $scope.camera);
		}
	};

	$rootScope.setLatLon = function (where, image) {
		
		$rootScope.closeAll();
		$rootScope.target = where;
		eval("$scope.lat = $rootScope."+$rootScope.target+".lat");
		eval("$scope.lon = $rootScope."+$rootScope.target+".lon");

		$('#latlonModal').modal('show');
		$('#latlonModal').on('shown.bs.modal', function() {
						
			$scope.$broadcast('rzSliderForceRender');
			console.log("render");		

			var canvas = document.getElementById("latlonCanvas");
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


			var geometry = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry(500, 500, 500));
			geometry.scale(-1, 1, 1);
			var loader = new THREE.CubeTextureLoader();
			var texture = loader.load([
				image.data.back,
				image.data.front,
				image.data.up,
				image.data.down,
				image.data.right,
				image.data.left
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

			var mesh = new THREE.Mesh(geometry, material);

			$scope.scene.add(mesh);
			$scope.renderer.render($scope.scene, $scope.camera);
		})
	}

	$scope.close = function () {
		$rootScope.target = null;
		$('#latlonModal').modal('hide');

		//$('#latlonCanvas').empty();
	}

	$rootScope.$on("CloseAll", function () {
		$scope.close();
	})


});

