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
                        var xAxisData = [];
                        var seriesData = [];
                        $.each(res.data, function (index, item) {
                            xAxisData.push(common.formatDate(item.createTime, "MM-dd"));
                            seriesData.push(item.quantity);
                        });
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
                                        data: xAxisData
                                    }],
                                    yAxis: [{  //Y轴
                                        type: 'value'
                                    }],
                                    series: [{ //内容
                                        type: 'line',
                                        data: seriesData,
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
            //生源来源渠道
            studentSourcWay: function () {
                admin.req({
                    url: setter.apiAddress.consultrecord.monthchartreport
                    , data: { designatedMonth: designatedMonth }
                    , done: function (res) {
                        var xAxisData = [];
                        var seriesData = [];
                        $.each(res.data, function (index, item) {
                            xAxisData.push(common.formatDate(item.createTime, "MM-dd"));
                            seriesData.push(item.quantity);
                        });
                        //--
                    }
                });
            },
            //生源来跟进情况
            studentFollowUp: function () {
                admin.req({
                    url: setter.apiAddress.consultrecord.monthchartreport
                    , data: { designatedMonth: designatedMonth }
                    , done: function (res) {
                        var xAxisData = [];
                        var seriesData = [];
                        $.each(res.data, function (index, item) {
                            xAxisData.push(common.formatDate(item.createTime, "MM-dd"));
                            seriesData.push(item.quantity);
                        });
                        //--
                    }
                });
            },
            //试听课情况
            studentAudition: function () {
                admin.req({
                    url: setter.apiAddress.consultrecord.monthchartreport
                    , data: { designatedMonth: designatedMonth }
                    , done: function (res) {
                        var xAxisData = [];
                        var seriesData = [];
                        $.each(res.data, function (index, item) {
                            xAxisData.push(common.formatDate(item.createTime, "MM-dd"));
                            seriesData.push(item.quantity);
                        });
                        //--
                    }
                });
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
                        var legendData = [];
                        var seriesData = res.data.seriesData;

                        $.each(res.data.legendData, function (index, leg) {
                            legendData.push(leg.name);
                        });

                        //课程咨询情况分析
                        var echnormline = []
                            , normline = [
                                {
                                    tooltip: {
                                        trigger: 'item',
                                        formatter: '{a} <br/>{b} : {c} ({d}%)'
                                    },
                                    legend: {
                                        data: legendData
                                    },
                                    series: [
                                        {
                                            name: '咨询课程',
                                            type: 'pie',
                                            radius: '55%',
                                            center: ['50%', '60%'],
                                            data: seriesData,
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
        });
        laydate.render({
            elem: '#TrialClass-TimeSelect'
            , type: 'month'
        });

        laydate.render({
            elem: '#ConsultRecord-TimeSelect'
            , type: 'month'
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

        charts.studentTransformation(common.nowdate());

        charts.studentCourse(common.nowdate());

        //来源渠道分析
        var echheapline = [], heapline = [
            {
                tooltip: {
                    trigger: 'axis'
                },
                legend: { data: ['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎'] },
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
                        data: [120, 132, 101, 134, 90, 230, 210]
                    },
                    {
                        name: '联盟广告',
                        type: 'line',
                        stack: '总量',
                        data: [220, 182, 191, 234, 290, 330, 310]
                    },
                    {
                        name: '视频广告',
                        type: 'line',
                        stack: '总量',
                        data: [150, 232, 201, 154, 190, 330, 410]
                    },
                    {
                        name: '直接访问',
                        type: 'line',
                        stack: '总量',
                        data: [320, 332, 301, 334, 390, 330, 320]
                    },
                    {
                        name: '搜索引擎',
                        type: 'line',
                        stack: '总量',
                        data: [820, 932, 901, 934, 1290, 1330, 1320]
                    }
                ]
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

        //试听课程分析
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
            , elemheaparea = $('#LAY-index-heaparea').children('div')
            , renderheaparea = function (index) {
                echheaparea[index] = echarts.init(elemheaparea[index], layui.echartsTheme);
                echheaparea[index].setOption(heaparea[index]);
                window.onresize = echheaparea[index].resize;
            };
        if (!elemheaparea[0]) return;
        renderheaparea(0);

        //咨询跟进分析
        var echnormline = []
            , normline = [
                {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    legend: {
                        data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎', '百度', '谷歌', '必应', '其他']
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
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
                            name: '直接访问',
                            type: 'bar',
                            data: [320, 332, 301, 334, 390, 330, 320]
                        },
                        {
                            name: '邮件营销',
                            type: 'bar',
                            stack: '广告',
                            data: [120, 132, 101, 134, 90, 230, 210]
                        },
                        {
                            name: '联盟广告',
                            type: 'bar',
                            stack: '广告',
                            data: [220, 182, 191, 234, 290, 330, 310]
                        },
                        {
                            name: '视频广告',
                            type: 'bar',
                            stack: '广告',
                            data: [150, 232, 201, 154, 190, 330, 410]
                        },
                        {
                            name: '搜索引擎',
                            type: 'bar',
                            data: [862, 1018, 964, 1026, 1679, 1600, 1570],
                            markLine: {
                                lineStyle: {
                                    type: 'dashed'
                                },
                                data: [
                                    [{ type: 'min' }, { type: 'max' }]
                                ]
                            }
                        },
                        {
                            name: '百度',
                            type: 'bar',
                            barWidth: 5,
                            stack: '搜索引擎',
                            data: [620, 732, 701, 734, 1090, 1130, 1120]
                        },
                        {
                            name: '谷歌',
                            type: 'bar',
                            stack: '搜索引擎',
                            data: [120, 132, 101, 134, 290, 230, 220]
                        },
                        {
                            name: '必应',
                            type: 'bar',
                            stack: '搜索引擎',
                            data: [60, 72, 71, 74, 190, 130, 110]
                        },
                        {
                            name: '其他',
                            type: 'bar',
                            stack: '搜索引擎',
                            data: [62, 82, 91, 84, 109, 110, 120]
                        }
                    ]
                }
            ]
            , elemnormline = $('#ConsultRecord-Chart').children('div')
            , rendernormline = function (index) {
                echnormline[index] = echarts.init(elemnormline[index], layui.echartsTheme);
                echnormline[index].setOption(normline[index]);
                window.onresize = echnormline[index].resize;
            };
        if (!elemnormline[0]) return;
        rendernormline(0);
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

    exports('financialanalysis', {})

});