var app = angular.module("slider", ['rzModule']);
app.directive("slider", function () {
	return {
		scope: {
			target: '=',
			options: '='
		},
		templateUrl: '../editor/modules/sliderTpl.html',
		controller: function ($scope, $element) {
			
			$scope.sizeOptions = {};
			$scope.element = $($element[0].children[1]);

			$scope.setNumber = function () {
				
				$scope.sizeOptions.floor = $scope.options[0];
				$scope.sizeOptions.ceil = $scope.options[1];

				$scope.sizeOptions.onChange = function () {
					$scope.target = Math.round($scope.size*$scope.options[2]*$scope.options[3])/$scope.options[3];
				};

				$scope.sizeOptions.translate = function (value) {
					return Math.round(value*$scope.options[2]*$scope.options[3])/$scope.options[3];
				};

				$scope.size = $scope.target/$scope.options[2];

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