var app = angular.module("colpicker", ['colorpicker.module']);
app.directive("colpicker", function () {
	return {
		scope: {
			target: '='
		},
		templateUrl: 'editor/modules/colorpickerTpl.html'
	};
});