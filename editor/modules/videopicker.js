var app = angular.module("videopicker", ['filepicker']);
app.directive("videopicker", function () {
	return {
		scope: {
			target: '=',
			folder: '='
		},
		templateUrl: '../editor/modules/videopickerTpl.html',
		controller: function ($scope) {
			
			$scope.add = function (type) {
				$scope.target[type] = "undefined";
			}
			
		}
	};
});