

function ManagerCntl($scope, $routeParams, $http, $rootScope, tcm_model) {

	$scope.views = {
		sprint:{active:true},
		suites:{active:false}
	}

	$scope.sprintTestInactive = false
	$scope.suiteTestInactive = true

	$scope.selectSprint = function(){
		$scope.sprintTestInactive = false
		$scope.suiteTestInactive = true
		$scope.views.sprint.active = true
		$scope.views.suites.active = false
	}

	$scope.selectSuites = function(){
		$scope.sprintTestInactive = true
		$scope.suiteTestInactive = false
		$scope.views.sprint.active = false
		$scope.views.suites.active = true
	}


}
ManagerCntl.$inject = ['$scope', '$routeParams', '$http', '$rootScope', 'tcm_model'];