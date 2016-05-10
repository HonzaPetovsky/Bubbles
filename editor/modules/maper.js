var app = angular.module("maper", []);
app.directive("maper", function () {
	return {
		scope: {
			target: '='
		},
		templateUrl: '../editor/modules/maperTpl.html',
		controller: function ($scope, $element) {

			$scope.element = $($element[0].children[2]);
			$scope.element.on('shown.bs.modal', function() {
				if ($scope.map) {
					$scope.map.invalidateSize();
				}
			})
			
			var canvas = $scope.element.find(".latlonCanvas")[0];
			$scope.map = L.map(canvas);
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			}).addTo($scope.map);
			
			$scope.marker = L.marker([0, 0], {draggable: true}).addTo($scope.map);
			
			$scope.setMap = function () {
				
				$scope.map.setView([$scope.target.lat, $scope.target.lon], 13);
				$scope.marker.setLatLng(L.latLng($scope.target.lat, $scope.target.lon));
				
				$scope.element.modal('show');
			}
			
			$scope.confirm = function () {
				var latlon = $scope.marker.getLatLng();
				$scope.target.lat = Math.round(latlon.lat*10000000)/10000000;
				$scope.target.lon = Math.round(latlon.lng*10000000)/10000000;
				$scope.element.modal('hide');
			}

			$scope.close = function () {
				$scope.element.modal('hide');
			}
		}
	};
});