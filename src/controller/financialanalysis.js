/**

 @Name：layuiAdmin Echarts
    
 */

layui.define(function (exports) {

    //区块轮播切换
    layui.use(['admin', 'carousel'], function () {
        var $ = layui.$
            , admin = layui.admin
            , carousel = layui.carousel
            , element = layui.element
            , device = layui.device();

        //轮播切换
        $('.layadmin-carousel').each(function () {
            var othis = $(this);
            carousel.render({
                elem: this
                , width: '100%'
                , arrow: 'none'
                , interval: othis.data('interval')
                , autoplay: othis.data('autoplay') === true
                , trigger: (device.ios || device.android) ? 'click' : 'hover'
                , anim: othis.data('anim')
            });
        });

    });

    //财务数据分析 - 订单总数分析 - 基本折线图
    layui.use(['echarts', 'admin', 'laydate', 'common', 'setter'], function () {
        var $ = layui.$
            , echarts = layui.echarts
            , admin = layui.admin
            , laydate = layui.laydate
            , common = layui.common
            , setter = layui.setter;

        var orderCountBasicLineChart = {
            initChart: function (value) {
                admin.req({
                    url: setter.apiAddress.studentcourseorder.ordermonthcahrtreport
                    , data: { designatedMonth: value }
                    , done: function (res) {
                        //订单总数分析
                        var echnormline = []
                            , normline = [
                                {
                                    title: {
                                        text: '订单总数分析',
                                        x: 'left',
                                        textStyle: {
                                            fontSize: 14
                                        }
                                    },
                                    tooltip: { //提示框
                                        trigger: 'axis',
                                        formatter: "{b}<br>订单数量：{c}"
                                    },
                                    xAxis: [{ //X轴
                                        type: 'category',
                                        data: res.data.xAxisData
                                    }],
                                    yAxis: [{  //Y轴
                                        type: 'value'
                                    }],
                                    series: [{ //内容
                                        type: 'line',
                                        data: res.data.seriesData,
                                    }]
                                }
                            ]
                            , elemnormline = $('#OrderCount-BasicLineChart-Container').children('div')
                            , rendernormline = function (index) {
                                echnormline[index] = echarts.init(elemnormline[index], layui.echartsTheme);
                                echnormline[index].setOption(normline[index]);
                                window.onresize = echnormline[index].resize;
                            };
                        if (!elemnormline[0]) return;
                        rendernormline(0);
                    }
                });
            }
        }
        //处理日历
        laydate.render({
            elem: '#OrderCount-BasicLineChart-TimeSelect'
            , type: 'month'
            , done: function (value, date) {
                orderCountBasicLineChart.initChart(value);
            }
        });

        orderCountBasicLineChart.initChart(common.nowdate());
    });

    //财务数据分析 - 课程订单 - 折线图堆叠
    layui.use(['echarts', 'admin', 'laydate', 'common', 'setter'], function () {
        var $ = layui.$
            , echarts = layui.echarts
            , admin = layui.admin
            , laydate = layui.laydate
            , common = layui.common
            , setter = layui.setter;
        var courseOrderCountStackedLineChart = {
            initChart: function (value) {
                admin.req({
                    url: setter.apiAddress.studentcourseorder.courseordermonthcahrtreport
                    , data: { designatedMonth: value }
                    , done: function (res) {
                        var echheapline = [], heapline = [
                            {
                                tooltip: {
                                    trigger: 'axis'
                                },
                                legend: res.data.legend,
                                calculable: true,
                                xAxis: res.data.xAxis,
                                yAxis: [
                                    {
                                        type: 'value'
                                    }
                                ],
                                series: res.data.series
                            }
                        ]
                            , elemheapline = $('#CourseOrderCount-StackedLineChart-Container').children('div')
                            , renderheapline = function (index) {
                                echheapline[index] = echarts.init(elemheapline[index], layui.echartsTheme);
                                echheapline[index].setOption(heapline[index]);
                                window.onresize = echheapline[index].resize;
                            };
                        if (!elemheapline[0]) return;
                        renderheapline(0);
                    }
                });
            }
        };

        //处理日历
        laydate.render({
            elem: '#CourseOrderCount-StackedLineChart-TimeSelect'
            , type: 'month'
            , done: function (value, date) {
                courseOrderCountStackedLineChart.initChart(value);
            }
        });

        courseOrderCountStackedLineChart.initChart(common.nowdate());
    });

    //财务数据分析 - 费用支出分析 - 基本饼图
    layui.use(['echarts', 'admin', 'laydate', 'common', 'setter'], function () {
        var $ = layui.$
            , echarts = layui.echarts
            , admin = layui.admin
            , laydate = layui.laydate
            , common = layui.common
            , setter = layui.setter;
        var spendingChart = {
            initChart: function (value) {
                admin.req({
                    url: setter.apiAddress.dailyspending.spendingreport
                    , data: { date: value }
                    , done: function (res) {
                        var echheapline = [], heapline = [
                            {
                                title: {
                                    text: '',
                                    subtext: '',
                                    left: 'center'
                                },
                                tooltip: {
                                    trigger: 'item',
                                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                                },
                                legend: {
                                    orient: 'horizontal',
                                    left: 'left',
                                    data: res.data.legendData
                                },
                                series: [
                                    {
                                        name: '支出项',
                                        type: 'pie',
                                        radius: '55%',
                                        center: ['50%', '60%'],
                                        data: res.data.seriesDecimalData,
                                        emphasis: {
                                            itemStyle: {
                                                shadowBlur: 10,
                                                shadowOffsetX: 0,
                                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                            , elemheapline = $('#Spending-Container').children('div')
                            , renderheapline = function (index) {
                                echheapline[index] = echarts.init(elemheapline[index], layui.echartsTheme);
                                echheapline[index].setOption(heapline[index]);
                                window.onresize = echheapline[index].resize;
                            };
                        if (!elemheapline[0]) return;
                        renderheapline(0);
                    }
                });
            }
        };

        //处理日历
        laydate.render({
            elem: '#Spending-TimeSelect'
            , type: 'month'
            , done: function (value, date) {
                spendingChart.initChart(value);
            }
        });

        spendingChart.initChart(common.nowdate());
    });

    //财务数据分析 - 课消金额 - 基本柱状图 -> TODO:目前无法统计出课消金额
    layui.use(['echarts', 'admin', 'laydate', 'common', 'setter'], function () {
        var $ = layui.$
            , echarts = layui.echarts
            , admin = layui.admin
            , laydate = layui.laydate
            , common = layui.common
            , setter = layui.setter;
        var incomeChart = {
            initChart: function (value) {
                admin.req({
                    url: setter.apiAddress.classroom.list
                    , data: { date: value }
                    , done: function (res) {
                        var echheaparea = [], heaparea = [
                            {
                                xAxis: {
                                    type: 'category',
                                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                                },
                                yAxis: {
                                    type: 'value'
                                },
                                series: [{
                                    data: [120, 200, 150, 80, 70, 110, 130],
                                    type: 'bar'
                                }]
                            }
                        ]
                            , elemheaparea = $('#Income-Container').children('div')
                            , renderheaparea = function (index) {
                                echheaparea[index] = echarts.init(elemheaparea[index], layui.echartsTheme);
                                echheaparea[index].setOption(heaparea[index]);
                                window.onresize = echheaparea[index].resize;
                            };
                        if (!elemheaparea[0]) return;
                        renderheaparea(0);
                    }
                });
            }
        };

        //处理日历
        laydate.render({
            elem: '#Income-TimeSelect'
            , type: 'month'
            , done: function (value, date) {
                incomeChart.initChart(value);
            }
        });

        //incomeChart.initChart(common.nowdate());
    });

    //财务数据分析 - 订单金额（预收款） - 堆叠区域图
    layui.use(['echarts', 'admin', 'laydate', 'common', 'setter'], function () {
        var $ = layui.$
            , echarts = layui.echarts
            , admin = layui.admin
            , laydate = layui.laydate
            , common = layui.common
            , setter = layui.setter;
        var orderAmountStackedAreaChart = {
            initChart: function (value) {
                //订单金额
                admin.req({
                    url: setter.apiAddress.classroom.list
                    , data: {}
                    , done: function (res) {
                        var echheaparea = [], heaparea = [
                            {
                                tooltip: {
                                    trigger: 'axis'
                                },
                                legend: {
                                    data: ['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎']
                                },
                                calculable: true,
                                xAxis: [
                                    {
                                        type: 'category',
                                        boundaryGap: false,
                                        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                                    }
                                ],
                                yAxis: [
                                    {
                                        type: 'value'
                                    }
                                ],
                                series: [
                                    {
                                        name: '邮件营销',
                                        type: 'line',
                                        stack: '总量',
                                        itemStyle: { normal: { areaStyle: { type: 'default' } } },
                                        data: [120, 132, 101, 134, 90, 230, 210]
                                    },
                                    {
                                        name: '联盟广告',
                                        type: 'line',
                                        stack: '总量',
                                        itemStyle: { normal: { areaStyle: { type: 'default' } } },
                                        data: [220, 182, 191, 234, 290, 330, 310]
                                    },
                                    {
                                        name: '视频广告',
                                        type: 'line',
                                        stack: '总量',
                                        itemStyle: { normal: { areaStyle: { type: 'default' } } },
                                        data: [150, 232, 201, 154, 190, 330, 410]
                                    },
                                    {
                                        name: '直接访问',
                                        type: 'line',
                                        stack: '总量',
                                        itemStyle: { normal: { areaStyle: { type: 'default' } } },
                                        data: [320, 332, 301, 334, 390, 330, 320]
                                    },
                                    {
                                        name: '搜索引擎',
                                        type: 'line',
                                        stack: '总量',
                                        itemStyle: { normal: { areaStyle: { type: 'default' } } },
                                        data: [820, 932, 901, 934, 1290, 1330, 1320]
                                    }
                                ]
                            }
                        ]
                            , elemheaparea = $('#OrderAmountStackedAreaChart-Container').children('div')
                            , renderheaparea = function (index) {
                                echheaparea[index] = echarts.init(elemheaparea[index], layui.echartsTheme);
                                echheaparea[index].setOption(heaparea[index]);
                                window.onresize = echheaparea[index].resize;
                            };
                        if (!elemheaparea[0]) return;
                        renderheaparea(0);
                    }
                });
            }
        };

        //处理日历
        laydate.render({
            elem: '#OrderAmountStackedAreaChart-TimeSelect'
            , type: 'month'
            , done: function (value, date) {
                orderAmountStackedAreaChart.initChart(value);
            }
        });

        //orderAmountStackedAreaChart.initChart(common.nowdate());
    });

    exports('financialanalysis', {})
});