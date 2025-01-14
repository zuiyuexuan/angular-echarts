'use strict';

/**
 * generate directive link function
 *
 * @param {Service} $http, http service to make ajax requests from angular
 * @param {String} type, chart type
 */
function getLinkFunction($http, theme, util, type) {
    return function (scope, element, attrs) {
        scope.config = scope.config || {};

        var dom  = element.find('div')[0],
            width, height, chart;

        function getSizes(config) {
            width = config.width || attrs.width || 320;
            height = config.height || attrs.height || 240;

            dom.style.width = width + 'px';
            dom.style.height = height + 'px';
        }

        function getOptions(data, config, type) {
            // merge default config
            config = angular.extend({
                showXAxis: true,
                showYAxis: true,
                showLegend: true,
            }, config);

            var grid = {
                x: 0,
                y: 5,
                width: width - 5,
                height: height - 35,
            };

            var xAxis = angular.extend({
                orient: 'top',
                axisLine: { show: false }
            }, angular.isObject(config.xAxis) ? config.xAxis : {});

            var yAxis = angular.extend({
                type: 'value',
                orient: 'right',
                scale: false,
                axisLine: {
                    show: false
                },
                axisLabel: {
                    formatter: function (v) {
                        return util.formatKMBT(v);
                    },
                },
            }, angular.isObject(config.yAxis) ? config.yAxis : {});

            // basic config
            var options = {
                title: util.getTitle(data, config, type),
                tooltip: util.getTooltip(data, config, type),
                legend: util.getLegend(data, config, type),
                toolbox: angular.extend({ show: false }, angular.isObject(config.toolbox) ? config.toolbox : {}),
                xAxis: [ angular.extend(xAxis, util.getAxisTicks(data, config, type)) ],
                yAxis: [ yAxis ],
                series: util.getSeries(data, config, type),
            };

            if (!config.showXAxis) {
                angular.forEach(options.xAxis, function (axis) {
                    axis.axisLine = { show: false };
                    axis.axisLabel = { show: false };
                    axis.axisTick = { show: false };
                });
            }

            if (!config.showYAxis) {
                angular.forEach(options.yAxis, function (axis) {
                    axis.axisLine = { show: false };
                    axis.axisLabel = { show: false };
                    axis.axisTick = { show: false };
                });
            }

            if (!config.showLegend || type === 'gauge') {
                delete options.legend;
            }

            if (!util.isAxisChart(type)) {
                delete options.xAxis;
                delete options.yAxis;
            }

            if (config.dataZoom) {
                options.dataZoom = angular.extend({
                    show : true,
                    realtime : true
                }, config.dataZoom);
            }

            options.grid = grid;

            return options;
        }

        function setOptions() {
            if (!scope.data || !scope.config) {
                return;
            }

            var options;

            getSizes(scope.config);

            if (!chart) {
                chart = echarts.init(dom, theme.get(scope.config.theme || 'macarons'));
            }

            // string type for data param is assumed to ajax datarequests
            if (angular.isString(scope.data)) {
                // show loading
                chart.showLoading({ text: scope.config.loading || '奋力加载中...' });

                // fire data request
                $http.get(scope.data).success(function (response) {
                    chart.hideLoading();
                    if (response.data) {
                        options = getOptions(response.data, scope.config, type);
                        if (scope.config.debug) {
                            console.log(options);
                            console.log(response);
                        }
                        if (scope.config.forceClear) {
                            chart.clear();
                        }
                        chart.setOption(options);
                        chart.resize();
                    } else {
                        throw new Error('angular-echarts: no data loaded from ' + scope.data);
                    }
                }).error(function (response) {
                    chart.hideLoading();
                    throw new Error('angular-echarts: error loading data from ' + scope.data);
                });

            // if data is avaliable, render immediately
            } else {
                options = getOptions(scope.data, scope.config, type);
                if (scope.config.debug) {
                    console.log(options);
                }
                if (scope.config.forceClear) {
                    chart.clear();
                }
                chart.setOption(options);
                chart.resize();
            }
        }

        // update when charts config changes
        scope.$watch(function () { return scope.config; }, function (value) {
            if (value) { setOptions(); }
        });

        // update when charts data changes
        scope.$watch(function () { return scope.data; }, function (value) {
            if (value) { setOptions(); }
        });

    };
}

/**
 * add directives
 */
angular.module('angular-echarts', ['angular-echarts.theme', 'angular-echarts.util'])
    .directive('lineChart', ['$http', 'theme', 'util', function ($http, theme, util) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope: {
                config: '=config',
                data: '=data'
            },
            link: getLinkFunction($http, theme, util, 'line')
        };
    }])
    .directive('barChart', ['$http', 'theme', 'util', function ($http, theme, util) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope: {
                config: '=config',
                data: '=data'
            },
            link: getLinkFunction($http, theme, util, 'bar')
        };
    }])
    .directive('areaChart', ['$http', 'theme', 'util', function ($http, theme, util) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope: {
                config: '=config',
                data: '=data'
            },
            link: getLinkFunction($http, theme, util, 'area')
        };
    }])
    .directive('pieChart', ['$http', 'theme', 'util', function ($http, theme, util) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope: {
                config: '=config',
                data: '=data'
            },
            link: getLinkFunction($http, theme, util, 'pie')
        };
    }])
    .directive('donutChart', ['$http', 'theme', 'util', function ($http, theme, util) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope: {
                config: '=config',
                data: '=data'
            },
            link: getLinkFunction($http, theme, util, 'donut')
        };
    }])
    .directive('gaugeChart', ['$http', 'theme', 'util', function ($http, theme, util) {
        return {
            restrict: 'EA',
            template: '<div></div>',
            scope: {
                config: '=config',
                data: '=data'
            },
            link: getLinkFunction($http, theme, util, 'gauge')
        };
    }]);

