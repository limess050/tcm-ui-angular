tcmModule.directive('ngTestcases', function(){
   return {
      restrict: 'E',
      transclude: false,
      scope:{requester:'=', btns:'=', tcminactive:'='},
      templateUrl: 'app/partials/testcases.html',
       controller: ["$scope", "$element", "$attrs", "$rootScope", 'tcm_model', 'draggedObjects', function($scope, element, $attrs, $rootScope, tcm_model, DO){

        $scope.showTCdelete = false
        $scope.selectall = false
        $scope.hideBulk = false;
        $scope.uuid = Math.floor(Math.random()*10000001);

        var draggedTests = {
          id: $scope.uuid,
          objects:[]
        }

        DO.draggedObjects.push(draggedTests)

        if(typeof $scope.btns !== 'undefined'){
          if($scope.btns.hideBulk){
            $scope.hideBulk = true;
          }
        }

        $scope.resetTestcasesObject = function(){
          $scope.testcases = [];
          for(var cs = $scope.$$childHead; cs; cs = cs.$$nextSibling) {
              cs.$destroy();
          }
        }

        $scope.resetNewTestcase = function(){
          $scope.newTC = {
            create:false,
            name:'',
            description:'',
            priority:1,
            proposed:0
          }
        }

        $scope.resetTestcasesObject();
        $scope.resetNewTestcase();


          $scope.$watch("requester.id",function(value){

            $scope.resetTestcasesObject();
              if(value != ''){
                if(value != 'none'){
                    $scope.getTestCases();
                  $scope.hideButtons = false
                }else{
                  $scope.hideButtons = true
                }
              }else{
                  $scope.hideButtons = true
              }
          })

          $scope.getTestCases = function(){
            $scope.resetTestcasesObject();
            $scope.resetNewTestcase();
            $scope.selectall = false
            $scope.showTCdelete = false
            if($scope.requester.type == 'tag'){
              tcm_model.TagsTcs.query({tid: $scope.requester.id},function(data){
                $scope.testcases = data;
                $scope.extendTcs();
              })
            }else if($scope.requester.type == 'feature'){
              tcm_model.TestCases.query({featureId: $scope.requester.id},function(data){
                $scope.testcases = data;
                $scope.extendTcs();
              })
            }else if($scope.requester.type == 'suite'){
              tcm_model.SuiteTests.query({sid: $scope.requester.id},function(data){
                $scope.testcases = data;
                $scope.extendTcs();
              })
            }

          }

        $scope.extendTcs = function(data){
          _.each($scope.testcases, function(obj){
            $scope.extendSingleTC(obj);
          });
        }

        $scope.extendSingleTC = function(singletc) {
          _.extend(singletc, {type:'test', editMode: false, editARMode:false, tcTemp:{}, delete:false, current:false, dropDownClose:true, checked:false, draggable:true, dragSingle:false});
        }


        $scope.updateTestCasesList = function(tc){
          var extended = tc
          $scope.extendSingleTC(extended);
            if($scope.areTcsChecked()){
              extended.draggable = false;
            }else{
              extended.draggable = true;
            }
            extended.dragSingle = false;
          $scope.testcases.push(extended);
        }


        $scope.deleteTCsBulk = function(){
          _.each($scope.testcases,function(tc){
            if(tc.checked == true){
              tc.$delete(function(){
                  $scope.tcDeleted(tc);
              })
            }
          })
        }

        $scope.cloneTcBulk = function(){

            var contraryPanel = _.without(DO.draggedObjects,_.findWhere(DO.draggedObjects,{id:$scope.uuid}))
          _.each($scope.testcases,function(tc){
            if(tc.checked == true){
              var newTc = new tcm_model.TestCasesCloneTC({tcId:tc.tcId});
              newTc.featureId = $scope.requester.id;
              newTc.$save(function(data){
                $rootScope.$broadcast('tcStatusUpdated', {featureId: $scope.requester.id});
                $scope.updateTestCasesList(data)
              })
            }
          })

        }
/* NEW TCs */

      $scope.createTC =  function(){
        if($scope.newTC.create == true){
          return false;
        }
        $scope.newTC.create = true;
        if($scope.requester.type == "feature"){
          $scope.newTC.featureId = $scope.requester.id;
        }else if($scope.requester.type == "suite"){
          $scope.newTC.sid = $scope.requester.id;
        }
        
      }

      $scope.saveNewTC = function(){

        if($scope.requester.type == "feature"){
          var temp = new tcm_model.TestCases($scope.newTC)
          temp.$save(function(data){
            $scope.updateTestCasesList(data)
            $rootScope.$broadcast('tcStatusUpdated', {featureId: $scope.requester.id});
          })
        }else if($scope.requester.type == "suite"){
          var temp = new tcm_model.SuiteTests()
          temp.sid = $scope.requester.id;
          temp.testArray = [$scope.newTC]
          temp.$create(function(data){
            _.each(data.response,function(tc){
              $scope.updateTestCasesList(tc)
              $rootScope.$broadcast('suiteTcStatusUpdated', {suiteId: $scope.requester.id});
            })
          })
        }



      }

      $scope.cancelNewTC = function(){

        $scope.resetNewTestcase()

      }

/*******************************************************/

  $rootScope.$on('featureCurrentTCadded', function(event, message){
    if(message.uuid != $scope.uuid){
      if($scope.tcminactive == false){
        $scope.updateTestCasesList(angular.copy(message.tc))
      }
    }

    $scope.draggable = true

  });


  $rootScope.$on('tcUntagged', function(event, message){
    if($scope.requester.type == 'tag' && $scope.requester.id == message.tag.id){
      $scope.removeTCfromScope(message.tc)
    }
  })

  $rootScope.$on('tcTagged', function(event, message){
    if($scope.requester.type == 'tag' && $scope.requester.id == message.tag.id){
      $scope.updateTestCasesList(angular.copy(message.tc))
    }
  })

  $scope.removeTCfromScope = function(tc){
    $scope.testcases = _.without($scope.testcases, _.findWhere($scope.testcases, {tcId: tc.tcId}));
  }

  $scope.tcDeleted = function(tc){
    $scope.removeTCfromScope(tc)
   // $scope.updateParentTcArray();
    if($scope.requester.type == 'feature'){
      $rootScope.$emit('tcDeleted', {featureId: tc.featureId});
    }
    $scope.manageDragState();
    $scope.verifyBulkDisplay();
  };

    $scope.tcUntagged = function(tc){
   $scope.testcases = _.without($scope.testcases, _.findWhere($scope.testcases, {tcId: tc.tcId}));
   // $scope.updateParentTcArray();
    $scope.manageDragState();
    $scope.verifyBulkDisplay();
  };

/*******************************************************/


  $scope.tcChecked = function(){
    $scope.manageDragState();
    // $scope.updateGlobalDraggableArray();
    $scope.verifyBulkDisplay()
 }

$scope.tcUnchecked = function(){
    $scope.manageDragState();
    // $scope.updateGlobalDraggableArray();
    $scope.verifyBulkDisplay();
 }

$scope.testSelected = function(tc){
   _.each($scope.testcases, function(obj){
      obj.current = false;
    })
    var setCurrent = _.findWhere($scope.testcases, {tcId: tc.tcId});
    setCurrent.current = true; 
}     
// $scope.$on('tcSelected', function(event, message){
//    _.each($scope.testcases, function(obj){
//       obj.current = false;
//     })
//     var setCurrent = _.findWhere($scope.testcases, {tcId: message.tc.tcId});
//     setCurrent.current = true;  
//  })


     


/*******************************************************/
  
        $scope.updateParentTcArray = function() {
          $scope.$parent.testcases = $scope.testcases;
        }

        $scope.selectAll = function(){
          $scope.testcases.forEach(function(tc){
            tc.checked = ($scope.selectall == true)?false:true;
          });
        }


        $scope.areTcsChecked = function(){
            var count = 0;
            _.each($scope.testcases, function(obj){
              if(obj.checked == true){
                count++
              }
            })
            if(count > 0){
              return true;
            }else {
              return false;
            }
         }

        $scope.manageDragState = function(){
            var count = 0;
              _.each($scope.testcases, function(obj){
                if(obj.checked == true){
                  count++
                }
              })
              if(count == 0){
                  _.each($scope.testcases, function(obj){
                      obj.draggable = true
                  })
              }else{
                   _.each($scope.testcases, function(obj){
                    if(obj.checked != true){
                      obj.draggable = false
                    }
                  })
              }
              // $scope.updateGlobalDraggableArray();
       }

       $scope.updateGlobalDraggableArray =  function(){
          _.each(DO.draggedObjects, function(objectArray){
            if(objectArray.id == $scope.uuid){
              objectArray.objects = $scope.testcases
            }
          })
          DO.currentDragUUID = $scope.uuid
       }

        $scope.verifyBulkDisplay = function(){

          var count = 0;
              _.each($scope.testcases, function(obj){
                if(obj.checked == true){
                  count++
                }
              })
            if(count > 1){
              $scope.showTCdelete = true;
              $scope.selectall = true
            }else{
              $scope.showTCdelete = false;
              $scope.selectall = false
            }

            if(count == $scope.testcases.length){
              $scope.selectall = true
            }else{
              $scope.selectall = false
            }


        }

        $scope.tcCheckedCount = function(){

          var count = 0;
          _.each($scope.testcases, function(obj){
            if(obj.checked == true){
              count++
            }
          })
          return count;
        }


        $scope.isEmpty = function(string){
          var result = /^\s*$/.test(string) || (string === null);
          return result;
        }


////////////////////DROP SECTION

            $scope.droppable = true;

            $scope.handleDrop = function(){

              $('.tcm-drag-helper').remove();

              if($scope.requester.type == 'tag'){
                DO.dropTestOnTagContainer($scope.requester, $scope.testcases)
              }else if($scope.requester.type == 'feature'){
                DO.dropTestsOnTestsContainer($scope.requester.id)
              }else if($scope.requester.type == 'suite'){
                DO.dropTestOnSuite($scope.requester.object, $scope)
              }

              $scope.draggable = true            

            }

      }],

       link: function (scope, element, attrs) {
              
       }
   }
});