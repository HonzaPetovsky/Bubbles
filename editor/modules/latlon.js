var app = angular.module("latlon", []);
app.directive("latlon", function () {
	return {
		scope: {
			target: '=',
			preview: '='
		},
		templateUrl: '../editor/modules/latlonTpl.html',
		controller: function ($scope, $element) {

			$scope.element = $($element[0].children[2]);

			$scope.latOptions = {
				floor: -85,
				ceil: 85,
				onChange: function () {
					$scope.target.lat = $scope.lat;
				}
			};

			$scope.lonOptions = {
				floor: 0,
				ceil: 359,
				onChange: function () {
					$scope.target.lon = $scope.lon;
				}
			};

			$scope.set = function () {
				$scope.lat = $scope.target.lat;
				$scope.lon = $scope.target.lon;

				$scope.element.modal('show');
				$scope.element.on('shown.bs.modal', function() {
					$scope.$broadcast('rzSliderForceRender');
				})
			}

			$scope.close = function () {
				$scope.element.modal('hide');
			}
		}
	};
});