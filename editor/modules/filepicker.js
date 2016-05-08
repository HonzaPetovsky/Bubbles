var app = angular.module("filepicker", []);
app.directive("filepicker", function () {
	return {
		scope: {
			target: '=',
			folder: '='
		},
		templateUrl: '../editor/modules/filepickerTpl.html',
		controller: function ($scope, $element, $http) {
			
			$scope.element = $($element[0].children[1]);

			$scope.content = [];
			$scope.files = [];
			$scope.folders = [];
			$scope.currentFolder = $scope.content;
			$scope.breadcrumbs = [$scope.folder];

			$scope.selectFile = function () {

				$http.get("../editor/files.php?dir="+$scope.folder).then(function(res){
					$scope.content = res.data;
					$scope.currentFolder = $scope.content;
					$scope.breadcrumbs = [$scope.folder];
					setFolder($scope.content);
				});

				$scope.element.modal('show');
			}

			$scope.select = function (file) {
				$scope.target = $scope.breadcrumbs.join('/')+'/'+file;
				$scope.close();
			}

			$scope.changeFolder = function (folder) {
				$scope.currentFolder = $scope.currentFolder[folder];
				$scope.breadcrumbs.push(folder);
				setFolder();
			}

			$scope.breadcrumbsChange = function (index) {
				var level = 0;
				var crumbs = $scope.breadcrumbs;
				$scope.breadcrumbs = [$scope.folder];
				$scope.currentFolder = $scope.content;
				setFolder();
				while (level != index) {
					level += 1;
					$scope.breadcrumbs.push(crumbs[level]);
					$scope.currentFolder = $scope.currentFolder[crumbs[level]];
					setFolder();
				}
			}

			$scope.close = function () {
				$scope.currentFolder = $scope.content;
				$scope.breadcrumbs = [$scope.folder];
				$scope.element.modal('hide');
			}

			function setFolder () {
				$scope.folders = [];
				$scope.files = [];
				for (key in $scope.currentFolder) {
					if (typeof($scope.currentFolder[key]) != 'string') {
						$scope.folders.push(key);
					} else {
						$scope.files.push($scope.currentFolder[key]);
					}
				}
			}
			
		}
	};
});