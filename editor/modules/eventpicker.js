var app = angular.module("eventpicker", ['dropdown']);
app.directive("eventpicker", function () {
	return {
		scope: {
			target: '=',
			actions: '=',
			data: '='
		},
		templateUrl: '../editor/modules/eventpickerTpl.html',
		controller: function ($scope, $element) {

			$scope.propertyTypes = ["opacity", "visible"];
			$scope.selectedItem = null;
			$scope.index = null;

			$scope.sizeOptionsSmall = {
				floor:  0,
				ceil: 10,
				translate: function (value) {
					return Math.round(value*0.1*10)/10;
				},
				onChange: function () {
					$scope.target[$scope.index].value = Math.round($scope.valueSmall)/10;
				}
			};

			$scope.showItem = {
				"changeBubble": ["id_bubbles"],
				"setProperty": ["id_objects", "property"],
				"toggleFullscreen": ["noparam"],
				"startGlass": ["noparam"],
				"toggleVideo": ["id_objects"],
				"toggleMap": ["noparam"]
			};
			$scope.showPropertyValue = {
				"opacity": ["valueSmall"],
				"visible": ["valueBool"]
			}
			$scope.propertyDefaults = {
				"opacity": 1.0,
				"visible": false
			}
			
			$scope.element = $($element[0].children[2]);

			$scope.editEvent = function (index) {
				$scope.selectedItem = $scope.target[index].action;
				$scope.index = index;
				switch ($scope.selectedItem) {
					case "changeBubble":
						$scope.id_bubbles = $scope.target[index].id;
						break;
					case "setProperty":
						$scope.id_objects = $scope.target[index].id;
						$scope.property = $scope.target[index].property;
						setPropertyValues($scope.target[index].property);
						break;
					case "toggleVideo":
						$scope.id_objects = $scope.target[index].id;
						break;
				}

				$scope.element.modal('show');
				$scope.element.on('shown.bs.modal', function() {
					$scope.$broadcast('rzSliderForceRender');
				})
			}

			function setPropertyValues (property) {
				switch (property) {
					case "opacity": 
						$scope.valueSmall = $scope.target[$scope.index].value*10;
						break;
					case "visible":
						$scope.valueBool = $scope.target[$scope.index].value;
						break;
				}
			}

			$scope.change_id_bubbles = function (id) {
				$scope.target[$scope.index].id = id;
				$scope.id_bubbles = id;
			}

			$scope.change_id_objects = function (id) {
				$scope.target[$scope.index].id = id;
				$scope.id_objects = id;
			}

			$scope.change_property = function (property) {
				$scope.property = property;
				$scope.target[$scope.index].property = property;
				$scope.target[$scope.index].value = $scope.propertyDefaults[property];
				setPropertyValues($scope.target[$scope.index].property);
			}

			$scope.change_valueBool = function () {
				$scope.target[$scope.index].value = !$scope.target[$scope.index].value;
				setPropertyValues("visible");
			}

			$scope.getIds = function () {
				var ids = [];
				for (bubble in $scope.data.bubbles) {
					for (key in $scope.data.bubbles[bubble].hotspots) {
						ids.push(key);
					}
				}
				for (key in $scope.data.hud) {
					ids.push(key);
				}
				return ids;
			}	

			$scope.show = function (id) {
				if ($scope.selectedItem) {
					return ($scope.showItem[$scope.selectedItem].indexOf(id) != -1);
				}
				return false;
			}	

			$scope.showVal = function (id) {
				if ($scope.property) {
					return ($scope.showPropertyValue[$scope.property].indexOf(id) != -1);
				}
				return false;
			}	

			$scope.addEvent = function (action) {
				$scope.target.push($scope.actions[action]);
			}

			$scope.removeEvent = function (index) {
				$scope.target.splice(index, 1);
			}

			$scope.close = function () {
				$scope.element.modal('hide');
			}
		
		}
	};
});