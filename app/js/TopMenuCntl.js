function TopMenuCntl($rootScope, $scope, $route, $routeParams, $location, $cookieStore, Auth, tcm_model) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;

    $scope.menuList = [
        {
            name: 'TCM',
            active: $location.path().indexOf('manager') >=0 || $location.path().indexOf('suites')>=0 ? 'active':'',
            subMenuList: [
                    {
                        name: "Iterations",
                        link: '#/manager/'+$routeParams.projectId,
                        active: $location.path().indexOf('manager') >=0 ? 'active':''
                    },
                    {
                        name: "Suites",
                        link: '#/suites/'+$routeParams.projectId,
                        active: $location.path().indexOf('suites') >=0 ? 'active':''
                    }
                ]
        },
        {
            name: 'Metrics',
            active: $location.path().indexOf('testplan') >=0 || $location.path().indexOf('rlsmetrics')>=0 || $location.path().indexOf('/metrics')>=0 ? 'active':'',
            subMenuList: [
                { name: 'TestPlan',
                  active: $location.path().indexOf('plan/') >=0 ? 'active':'',
                  link: '#/metrics/plan/'+$routeParams.projectId
                },
                { name: 'Release',
                  active: $location.path().indexOf('release/') >=0 ? 'active':'',
                    link: '#/metrics/release/'+$routeParams.projectId
                },
                { name: 'Iteration',
                  active: $location.path().indexOf('iterations/') >=0 ? 'active':'',
                    link: '#/metrics/iterations/'+$routeParams.projectId
                }]
        },
        {
            name: 'Plugins',
            active: $location.path().indexOf('sync') >=0 || $location.path().indexOf('import-export')>=0 ? 'active':'',
            subMenuList:[
                { name: 'JIRA Sync',
                  active: $location.path().indexOf('sync') >=0 ? 'active':'',
                    link: '#/jira/'+$routeParams.projectId
                },
                { name: 'Import/Export',
                    active: $location.path().indexOf('import-export') >=0 ? 'active':'',
                    link: '#/import-export'
                }
            ]
        }
    ];

    $scope.topmenu = 'app/partials/topmenu.html';

    $scope.loadProjects = function(){
        tcm_model.Projects.query(function(data){
            $scope.projects = data;

            for(var i=0; i < data.length; i++){

                if(data[i].id.toString() === $routeParams.projectId){

                    $scope.currentProject = data[i].name;
                }
            }
        });
    }



    $scope.switchProject = function(project){

        tcm_model.Projects.update(project.id, {active: '1'}, function(){})
        $location.path('/manager/' + project.id);
    };

    $scope.isActiveMenu = function(element){
        return 'active';
    }

    $scope.getProfile = function(){
        tcm_model.Profile.get(function(data){

            $scope.userName = data.displayName;
            $scope.avatar = data.avatar;
            Auth.user = data;
            $scope.isAdmin = data.admin === 1;
        })

    }


    $scope.getProfile();
    $scope.loadProjects();



}

TopMenuCntl.$inject = ['$rootScope', '$scope', '$route', '$routeParams', '$location', '$cookieStore', 'Auth', 'tcm_model'];