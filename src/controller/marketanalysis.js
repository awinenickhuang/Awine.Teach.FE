/**

 @Name：Marketanalysis Echarts 市场数据统计分析图表
    
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

    //市场分析
    layui.use(['echarts', 'admin', 'laydate', 'common', 'setter'], function () {
        var $ = layui.$
            , echarts = layui.echarts
            , admin = layui.admin
            , laydate = layui.laydate
            , common = layui.common
            , setter = layui.setter;

        var charts = {
            //生源数量分析
            studentSource: function (designatedMonth) {
                admin.req({
                    url: setter.apiAddress.consultrecord.monthchartreport
                    , data: { designatedMonth: designatedMonth }
                    , done: function (res) {
                        //生源数量分析
                        var echnormline = []
                            , normline = [
                                {
                                    title: {
                                        text: '生源数量分析',
                                        x: 'left',
                                        textStyle: {
                                            fontSize: 14
                                        }
                                    },
                                    tooltip: { //提示框
                                        trigger: 'axis',
                                        formatter: "{b}<br>生源数量：{c}"
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
                            , elemnormline = $('#StudentSource-Line').children('div')
                            , rendernormline = function (index) {
                                echnormline[index] = echarts.init(elemnormline[index], layui.echartsTheme);
                                echnormline[index].setOption(normline[index]);
                                window.onresize = echnormline[index].resize;
                            };
                        if (!elemnormline[0]) return;
                        rendernormline(0);
                    }
                });
            },
            //生源来源渠道情况（当月每天的试所有渠道试听情况）
            studentSourceChannel: function (designatedMonth) {
                admin.req({
                    url: setter.apiAddress.consultrecord.studentsourcechannelreport
                    , data: { designatedMonth: designatedMonth }
                    , done: function (res) {
                        //来源渠道分析
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
                            , elemheapline = $('#MarketingChannel-heapline').children('div')
                            , renderheapline = function (index) {
                                echheapline[index] = echarts.init(elemheapline[index], layui.echartsTheme);
                                echheapline[index].setOption(heapline[index]);
                                window.onresize = echheapline[index].resize;
                            };
                        if (!elemheapline[0]) return;
                        renderheapline(0);
                    }
                });
            },
            //试听课程情况（当月每天的试所有课程试听情况）
            trialClassReportChart: function (designatedMonth) {
                admin.req({
                    url: setter.apiAddress.trialclass.trialclassreportchart
                    , data: { designatedMonth: designatedMonth }
                    , done: function (res) {
                        //试听课程分析
                        var echheaparea = [], heaparea = [
                            {
                                tooltip: {
                                    trigger: 'axis'
                                },
                                legend: {
                                    data: res.data.legend
                                },
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
                            , elemheaparea = $('#LAY-index-heaparea').children('div')
                            , renderheaparea = function (index) {
                                echheaparea[index] = echarts.init(elemheaparea[index], layui.echartsTheme);
                                echheaparea[index].setOption(heaparea[index]);
                                window.onresize = echheaparea[index].resize;
                            };
                        if (!elemheaparea[0]) return;
                        renderheaparea(0);

                    }
                })
            },
            //营销转化情况
            studentTransformation: function (designatedMonth) {
                admin.req({
                    url: setter.apiAddress.consultrecord.studenttransformationtreport
                    , data: { designatedMonth: designatedMonth }
                    , done: function (res) {
                        var yAxisData = [];
                        var seriesData = [];
                        $.each(res.data.horizontalBarChartYAxis, function (index, item) {
                            yAxisData.push(item.name);
                        });
                        $.each(res.data.horizontalBarChartSeries, function (index, item) {
                            seriesData.push(item.count);
                        });
                        //营销转化分析
                        var echarea = [], area = [
                            {
                                title: {
                                    text: '营销转化分析',
                                    x: 'left',
                                    textStyle: {
                                        fontSize: 14
                                    }
                                },
                                tooltip: {
                                    trigger: 'axis'
                                },
                                legend: {
                                    data: ['2011年']
                                },
                                calculable: true,
                                xAxis: [
                                    {
                                        type: 'value',
                                        boundaryGap: [0, 0.01]
                                    }
                                ],
                                yAxis: [
                                    {
                                        type: 'category',
                                        data: yAxisData
                                    }
                                ],
                                series: [
                                    {
                                        name: '数量',
                                        type: 'bar',
                                        data: seriesData
                                    }
                                ]
                            }
                        ]
                            , elemarea = $('#MarketingTransformationAnalysis').children('div')
                            , renderarea = function (index) {
                                echarea[index] = echarts.init(elemarea[index], layui.echartsTheme);
                                echarea[index].setOption(area[index]);
                                window.onresize = echarea[index].resize;
                            };
                        if (!elemarea[0]) return;
                        renderarea(0);
                    }
                });
            },
            //咨询课程情况
            studentCourse: function (designatedMonth) {
                admin.req({
                    url: setter.apiAddress.consultrecord.coursemonthchartreport
                    , data: { designatedMonth: designatedMonth }
                    , done: function (res) {
                        //课程咨询情况分析
                        var echnormline = []
                            , normline = [
                                {
                                    tooltip: {
                                        trigger: 'item',
                                        formatter: '{a} <br/>{b} : {c} ({d}%)'
                                    },
                                    legend: {
                                        data: res.data.legendData
                                    },
                                    series: [
                                        {
                                            name: '咨询课程',
                                            type: 'pie',
                                            radius: '55%',
                                            center: ['50%', '60%'],
                                            data: res.data.seriesData,
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
                            , elemnormline = $('#CourseConsultationVolumeAnalysis').children('div')
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

        laydate.render({
            elem: '#StudentSource-TimeSelect'
            , type: 'month'
            , done: function (value, date) {
                charts.studentSource(value);
            }
        });

        laydate.render({
            elem: '#MarketingChannel-TimeSelect'
            , type: 'month'
            , done: function (value, date) {
                charts.studentSourceChannel(value);
            }
        });

        laydate.render({
            elem: '#TrialClass-TimeSelect'
            , type: 'month'
            , done: function (value, date) {
                charts.trialClassReportChart(value);
            }
        });

        laydate.render({
            elem: '#MarketingTransformationAnalysis-TimeSelect'
            , type: 'month'
            , done: function (value, date) {
                charts.studentTransformation(value);
            }
        });

        laydate.render({
            elem: '#CourseConsultationVolumeAnalysis-TimeSelect'
            , type: 'month'
            , done: function (value, date) {
                charts.studentCourse(value);
            }
        });

        //加载统计图 - 默认展示当月数据
        charts.studentSource(common.nowdate());

        charts.studentSourceChannel(common.nowdate());

        charts.trialClassReportChart(common.nowdate());

        charts.studentTransformation(common.nowdate());

        charts.studentCourse(common.nowdate());
    });

    //地图 - > 平台机构分布图
    layui.use(['echarts'], function () {
        var $ = layui.$
            , echarts = layui.echarts;

        var echplat = [], plat = [
            {
                title: {
                    text: '2011全国GDP（亿元）',
                    subtext: '数据来自国家统计局',
                    x: 'left',
                    textStyle: {
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'item'
                },
                dataRange: {
                    orient: 'horizontal',
                    min: 0,
                    max: 55000,
                    text: ['高', '低'],           // 文本，默认为数值文本
                    splitNumber: 0
                },
                series: [
                    {
                        name: '2011全国GDP分布',
                        type: 'map',
                        mapType: 'china',
                        mapLocation: {
                            x: 'center'
                        },
                        selectedMode: 'multiple',
                        itemStyle: {
                            normal: { label: { show: true } },
                            emphasis: { label: { show: true } }
                        },
                        data: [
                            { name: '西藏', value: 605.83 },
                            { name: '青海', value: 1670.44 },
                            { name: '宁夏', value: 2102.21 },
                            { name: '海南', value: 2522.66 },
                            { name: '甘肃', value: 5020.37 },
                            { name: '贵州', value: 5701.84 },
                            { name: '新疆', value: 6610.05 },
                            { name: '云南', value: 8893.12 },
                            { name: '重庆', value: 10011.37 },
                            { name: '吉林', value: 10568.83 },
                            { name: '山西', value: 11237.55 },
                            { name: '天津', value: 11307.28 },
                            { name: '江西', value: 11702.82 },
                            { name: '广西', value: 11720.87 },
                            { name: '陕西', value: 12512.3 },
                            { name: '黑龙江', value: 12582 },
                            { name: '内蒙古', value: 14359.88 },
                            { name: '安徽', value: 15300.65 },
                            { name: '北京', value: 16251.93, selected: true },
                            { name: '福建', value: 17560.18 },
                            { name: '上海', value: 19195.69, selected: true },
                            { name: '湖北', value: 19632.26 },
                            { name: '湖南', value: 19669.56 },
                            { name: '四川', value: 21026.68 },
                            { name: '辽宁', value: 22226.7 },
                            { name: '河北', value: 24515.76 },
                            { name: '河南', value: 26931.03 },
                            { name: '浙江', value: 32318.85 },
                            { name: '山东', value: 45361.85 },
                            { name: '江苏', value: 49110.27 },
                            { name: '广东', value: 53210.28, selected: true }
                        ]
                    }
                ]
            }
        ]
            , elemplat = $('#LAY-index-plat').children('div')
            , renderplat = function (index) {
                echplat[index] = echarts.init(elemplat[index], layui.echartsTheme);
                echplat[index].setOption(plat[index]);
                window.onresize = echplat[index].resize;
            };
        if (!elemplat[0]) return;
        renderplat(0);
    });

    exports('marketanalysis', {})

});