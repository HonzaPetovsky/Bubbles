var app = angular.module("bubblesEditor", ['dropdown', 'colpicker', 'filepicker', 'slider', 'latlon', 'numberpicker', 'eventpicker', 'maper']);

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
		$http.post("../editor/save.php",{
			'file':$rootScope.dataFolder,
			'data':angular.toJson($rootScope.data, true)
		});
		$('#saveModal').modal('hide');
	}
	
	$rootScope.refreshPage = function () {
		$window.location.reload();
	}
	
	$rootScope.close = function () {
		$('#saveModal').modal('hide');
	}

}]);

app.controller("editorController", function($rootScope, $scope) {

	$scope.imageTypes = ["cube", "sphere", "video"];
	$scope.hotspotTypes = ["image", "video"];
	$scope.alignTypes = ["center", "left", "top", "bottom", "right", "topleft", "topright", "bottomleft", "bottomright"];
	$scope.undefinedTypes = {
		"sphere": "undefined",
		"cube": {
			"back": "undefined",
			"down": "undefined",
			"front": "undefined",
			"left": "undefined",
			"right": "undefined",
			"up": "undefined"
		},
		"video": {}
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
			"view": {
				"lat": 0,
				"lon": 0
			},
			"hotspots": {}
		},
		"hotspot": {
			"type": "image",
			"url": "undefined",
			"lat": 0,
			"lon": 0,
			"distorted": true,
			"events": {
				"onclick": [],
				"onover": [],
				"onout": [],
				"ondown": [],
				"onup": []
			}
		},
		"marker": {
			"lat": 0,
			"lon": 0,
			"target": "undefined"
		}
	}
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
		},
		"startGlass": {
			"action": "startGlass"
		},
		"toggleMap": {
			"action": "toggleMap"
		}
	}


	$scope.imageTypeChange = function (image) {
		console.log(image);
	}

	$scope.hotspotModel = [];
	$scope.newHotspot = function (key) {
		if ($scope.hotspotModel[key] != undefined && $scope.hotspotModel[key] != "" && !($scope.hotspotModel[key] in $rootScope.data.bubbles[key].hotspots)) {

			$rootScope.data.bubbles[key].hotspots[$scope.hotspotModel[key]] = angular.copy($scope.newValues.hotspot);
			$scope.hotspotModel[key] = undefined;
		}
	}

	$scope.newBubble = function () {
		if ($scope.bubbleModel != undefined && $scope.bubbleModel != "" && !($scope.bubbleModel in $rootScope.data.bubbles)) {

			$rootScope.data.bubbles[$scope.bubbleModel] = angular.copy($scope.newValues.bubble);
			$scope.bubbleModel = undefined;
		}
	}

	$scope.newHud = function () {
		if ($scope.hudModel != undefined && $scope.hudModel != "" && !($scope.hudModel in $rootScope.data.hud)) {

			$rootScope.data.hud[$scope.hudModel] = angular.copy($scope.newValues.hud);
			$scope.hudModel = undefined;
		}
	}

	$scope.newMarker = function () {
		$rootScope.data.map.markers.push(angular.copy($scope.newValues.marker));
	}

	$scope.addLensflare = function (key) {
		$rootScope.data.bubbles[key].lensflare = {"lat":0,"lon":0,"size":1};
	}

	$scope.remove = function (target) {
		eval("delete $rootScope."+target);
	}
	
	$scope.removeMarker = function (key) {
		$rootScope.data.map.markers.splice(key, 1);
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

