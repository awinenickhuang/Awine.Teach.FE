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

    //开班数量分析 - 基本折线图
    layui.use(['echarts', 'admin', 'laydate', 'common', 'setter'], function () {
        var $ = layui.$
            , echarts = layui.echarts
            , admin = layui.admin
            , laydate = layui.laydate
            , common = layui.common
            , setter = layui.setter;

        var classNumberBasicLineChart = {
            initChart: function (value) {
                admin.req({
                    url: setter.apiAddress.classes.classnumberchartreport
                    , data: { designatedMonth: value }
                    , done: function (res) {
                        //订单总数分析
                        var echnormline = []
                            , normline = [
                                {
                                    title: {
                                        text: '开班数量分析',
                                        x: 'left',
                                        textStyle: {
                                            fontSize: 14
                                        }
                                    },
                                    tooltip: { //提示框
                                        trigger: 'axis',
                                        formatter: "{b}<br>开班数量：{c}"
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
                            , elemnormline = $('#ClasNumber-BasicLine').children('div')
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
            elem: '#ClasNumber-TimeSelect'
            , type: 'month'
            , done: function (value, date) {
                classNumberBasicLineChart.initChart(value);
            }
        });

        classNumberBasicLineChart.initChart(common.nowdate());
    });

    //XXX分析 - xxx图
    layui.use(['echarts', 'admin', 'laydate', 'common', 'setter'], function () {
        var $ = layui.$
            , echarts = layui.echarts
            , admin = layui.admin
            , laydate = layui.laydate
            , common = layui.common
            , setter = layui.setter;

        var classNumberBasicLineChart = {
            initChart: function (value) {
                admin.req({
                    url: setter.apiAddress.classes.classnumberchartreport
                    , data: { designatedMonth: value }
                    , done: function (res) {

                    }
                });
            }
        }
        //处理日历
        laydate.render({
            elem: '#ClasNumber-TimeSelect'
            , type: 'month'
            , done: function (value, date) {
                classNumberBasicLineChart.initChart(value);
            }
        });

        //classNumberBasicLineChart.initChart(common.nowdate());
    });

    exports('educationalanalysis', {})

});