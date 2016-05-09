var app = angular.module("dropdown", []);
app.directive("dropdown", function () {
	return {
		scope: {
			data: '=',
			target: '=',
			type: '=',
			after: '&?'
		},
		templateUrl: '../editor/modules/dropdownTpl.html',
		controller: function ($scope) {
			
			$scope.update = function (key) {
				$scope.target = key;
			}
			
			$scope.$watch('target', function (newValue, oldValue) {
				if ($scope.after !== undefined) {
					if (newValue != oldValue) {
						$scope.after();
					}
				}
			});

		}
	};
});