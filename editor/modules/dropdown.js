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
				if ($scope.after !== undefined) {
					$scope.after();
				}
			}

		}
	};
});