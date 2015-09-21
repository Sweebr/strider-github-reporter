'use strict';

var app = window.app;
var configDefaults = {
  errorLog: 'unit-test-errors.log',
  reunnerLog: 'umit-test-runner.log'
};

/*
* $scope.configs, $scope.branch and $scope.pluginConfig, among others are available from the parent scope
* */
app.controller('GithubReportController', ['$scope', function ($scope) {
	$scope.saving = false;

	$scope.$watch('configs[branch.name].ghReporter.config', function (value) {
		$scope.config = value || configDefaults;
	});

	$scope.save = function () {
		$scope.saving = true;
		$scope.pluginConfig('ghReporter', $scope.config, function () {
			$scope.saving = false;
		});
	};
}]);
