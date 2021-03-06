function MetricsInteropCntl( $scope, $routeParams, tcm_model) {

    $scope.executionGraph = {
        options: {
            chart: {
                plotBackgroundColor: null,
                height:200,
                width:300,
                margin: [40, 0, 0, 0],
                animation:true

            },
            //'[{"Not Run":6,"In Progress":0,"Passed":10,"Failed":0,"Blocked":0}]'
            colors: ['#c6c6c6','#46ACCA', '#5DB95D', '#CD433D', '#FAA328'],

            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        connectorColor: '#000000',
                        formatter: function() {
                            // return InteropMetricsView.fetchTCsbyStatus(this.x);
                            return '<b>'+ this.point.name +'</b>: '+ Math.round(this.percentage) +' %';
                        }
                    }
                },
                series: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    point: {
                        events: {
                            select: function() {
                                $('#InteropMetrics #tc-container').css('visibility','visible');
                                // console.log(this)
                                $(container).data('series',this.x);
                                $(container).data('name',iterName);

                                chart = $(container);

                                // console.log(chart)

                                $('#info-tc-modal-io #tc-container').children().remove();

                                $('#info-tc-modal-io').find('.feature-title').text($(container).find('.highcharts-title tspan').text() +' - '+ this.name + ' test cases')
                                // console.log(this,$(container))
                                InteropMetricsView.fetchTCsbyStatus(this.x,chart);
                            },
                            unselect: function() {
                                $('#InteropMetrics #tc-container').children().remove();
                            }
                        }
                    }
                }
            }
        }
    };

    $scope.dailyGraph = {
        options: {
            chart: {
                height:200,
                width:300
            },
            title: {
                text: 'Daily Execution',
                x: -20 //center
            },

            yAxis: {
                title: {
                    text: 'Test Cases'
                }
            },

        }

    }

    tcm_model.metrics.ReleaseExecuted.query({'releaseId': 31}, function(metricsExecuted){
        var chartData = new Array();

        $scope.iterName = metricsExecuted[0].iterName;

        $scope.executionGraph.title= {
            text: metricsExecuted[0]['iterName']
        }
        delete metricsExecuted[0]['iterName'];
        var total = 0;

        _.each(metricsExecuted[0], function(value, key, list){

            chartData.push(new Array( key, value));
            total += value
        });

        $scope.executionGraph.total = total;
        console.log($scope.executionGraph.total);

        $scope.executionGraph.series = [{
            type: 'pie',
            name: 'Test Cases',
            data: chartData
        }]

        $scope.setActiveGraph($scope.executionGraph);

    });

    tcm_model.metrics.ReleaseDaily.query({'releaseId': 31}, function(data){
        var metricsDaily = data;
        if(metricsDaily.length > 0){

            var days = new Array();
            var testcases = new Array();


            _.each(metricsDaily, function(value, key, list){
                days.push(value.day);
                testcases.push(value.testcases);
            });


            $scope.dailyGraph.series = [{
                showInLegend: false,
                data: testcases
            }];

            $scope.dailyGraph.options.chart.xAxis = {
                categories: days,
                    title: {
                    text: 'Days'
                }
            };
        }

        $scope.setPreviewGraph($scope.dailyGraph);
    });


    $scope.setPreviewGraph = function(graph){
        $scope.previewGraph = $.extend(true, {}, graph);
        $scope.previewGraph.options.chart.width = 300;
        $scope.previewGraph.options.chart.height = 200;
    }

    $scope.setActiveGraph = function(graph){
        $scope.selectedGraph = $.extend(true, {}, graph);
        $scope.selectedGraph.options.chart.width = 900;
        $scope.selectedGraph.options.chart.height = 550;
    }


    $scope.switchGraph = function(){
        var toPreview = $.extend(true, {}, $scope.selectedGraph);
        var toSelected = $.extend(true, {}, $scope.previewGraph);

        $scope.setPreviewGraph(toPreview);
        $scope.setActiveGraph(toSelected);
    }
}

MetricsInteropCntl.$inject = [ '$scope', '$routeParams', 'tcm_model'];
