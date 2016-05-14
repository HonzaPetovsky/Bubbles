var app = angular.module("numberpicker", []);
app.directive("numberpicker", function () {
	return {
		scope: {
			target: '=',
			min: '=?',
			max: '=?'
		},
		templateUrl: 'editor/modules/numberpickerTpl.html',
		controller: function ($scope, $element) {
			
			$scope.element = $($element[0].children[1]);

			$scope.setNumber = function () {
				$scope.number = $scope.target;
				$scope.element.modal('show');
			}

			$scope.change = function () {
				if ($scope.number == null) {
					$scope.number = 0;
				}
				$scope.target = $scope.number;
			}

			$scope.close = function () {
				$scope.element.modal('hide');
			}
		
		}
	};
});