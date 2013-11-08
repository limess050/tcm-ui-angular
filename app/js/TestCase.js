tcmModule.directive('ngTestcase', function(){
   return {
      restrict: 'E',
      transclude: true,
       templateUrl: 'app/partials/testcase.html',
       controller: ["$scope", "$element", "$attrs", "$rootScope", 'tcm_model', function($scope, element, $attrs, $rootScope, tcm_model){

        $scope.deleteText = "Sure?";
        $scope.draggable = $scope.tc.draggable;

        $scope.$watch('tc.checked', function(newValue, oldValue){
            if (newValue == oldValue) {
              return false;
            }
          if(newValue == true){
            $scope.tc.draggable = newValue;
            $scope.$parent.tcChecked()
          }else{
            $scope.$parent.tcUnchecked()
            if($scope.$parent.areTcsChecked()){
              $scope.draggable = $scope.tc.draggable;
            }else{
              $scope.draggable = true;
            }
          }
        })

        $scope.$watch('tc.draggable', function(newValue, oldValue){
            if (newValue == oldValue) {
              return false;
            }

            $scope.draggable = $scope.tc.draggable;
        })

        
        $scope.selectTc= function(){

          if($scope.checked == true){
            return false;
          }
          if($scope.tc.current == true){
            $scope.tc.current = false;
            return false;
          }
          $scope.$parent.$broadcast('tcSelected', {tc: $scope.tc});

        }

        $scope.editTC = function(tc){
          tc.editMode = true; 
          var temp = angular.copy(tc);
          tc.tcTemp = temp;
        }

        $scope.cancelEditTC = function(tc){
          tc.editMode = false; 
          tc.name = tc.tcTemp.name
          tc.description = tc.tcTemp.description
        }

        $scope.saveTC = function(tc){
          tc.editMode = false;
          var temp = angular.copy(tc);
          tc.$update();
        }

        $scope.deleteTC = function(){
          $scope.deleteText = "Deletting...";
          $scope.tc.delete = true;
          $scope.tc.$delete(function(){
              $scope.tcDeleted(angular.copy($scope.tc));
              $scope.$destroy()
          })
        }

        $scope.handleDragStart = function(){

          if($scope.$parent.areTcsChecked()){
            if($scope.$parent.tcCheckedCount() > 1){
              $scope.tc.dragSingle = false;
            }else{
              $scope.tc.dragSingle = true;
            }
          }else{
              $scope.tc.dragSingle = true;
          }
        }

        $scope.handleDragRevert = function(tc){
        }

        $scope.$parent.$on('tcDeleteBulk', function(event, message){
          if($scope.tc.checked == true){
            $scope.deleteTC($scope.tc);
          }
        })


       }],

       link: function (scope, element, attrs) {
              
       }
   }
});