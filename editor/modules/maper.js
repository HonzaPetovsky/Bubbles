var app = angular.module("maper", []);
app.directive("maper", function () {
	return {
		scope: {
			target: '=',
		},
		templateUrl: '../editor/modules/maperTpl.html',
		controller: function ($scope, $element) {

			$scope.element = $($element[0].children[2]);

			

			$scope.close = function () {
				$scope.element.modal('hide');
			}
		}
	};
});