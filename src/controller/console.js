/**

 @Name：主页控制台
    
 */

layui.define(function (exports) {

    /*
      使用 layui.use 分段加载不同的模块，实现不同区域的同时渲染，从而保证视图的快速呈现
    */

    //区块轮播切换
    layui.use(['admin', 'carousel', 'oidcsetup'], function () {
        var $ = layui.$
            , admin = layui.admin
            , carousel = layui.carousel
            , element = layui.element
            , device = layui.device()
            , oidcsetup = layui.oidcsetup

        //退出登录
        $('.logout').on('click', function (event) {
            event.preventDefault();
            oidcsetup.signoutRedirect().catch(function (error) {
                console.error('退出时发生错误', error);
            });
        });

        //轮播切换 -> 初始化首页所有的轮播效果
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

        element.render('progress');

    });

    //数据概览
    layui.use(['admin', 'carousel', 'echarts'], function () {
        var $ = layui.$
            , admin = layui.admin
            , carousel = layui.carousel
            , echarts = layui.echarts;

        var echartsApp = [], options = [
            //今日流量趋势
            {
                title: {
                    text: '今日流量趋势',
                    x: 'center',
                    textStyle: {
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['', '']
                },
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30']
                }],
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                    name: 'PV',
                    type: 'line',
                    smooth: true,
                    itemStyle: { normal: { areaStyle: { type: 'default' } } },
                    data: [111, 222, 333, 444, 555, 666, 3333, 33333, 55555, 66666, 33333, 3333, 6666, 11888, 26666, 38888, 56666, 42222, 39999, 28888, 17777, 9666, 6555, 5555, 3333, 2222, 3111, 6999, 5888, 2777, 1666, 999, 888, 777]
                }, {
                    name: 'UV',
                    type: 'line',
                    smooth: true,
                    itemStyle: { normal: { areaStyle: { type: 'default' } } },
                    data: [11, 22, 33, 44, 55, 66, 333, 3333, 5555, 12666, 3333, 333, 666, 1188, 2666, 3888, 6666, 4222, 3999, 2888, 1777, 966, 655, 555, 333, 222, 311, 699, 588, 277, 166, 99, 88, 77]
                }]
            },

            //访客浏览器分布
            {
                title: {
                    text: '访客浏览器分布',
                    x: 'center',
                    textStyle: {
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    data: ['Chrome', 'Firefox', 'IE 8.0', 'Safari', '其它浏览器']
                },
                series: [{
                    name: '访问来源',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '50%'],
                    data: [
                        { value: 9052, name: 'Chrome' },
                        { value: 1610, name: 'Firefox' },
                        { value: 3200, name: 'IE 8.0' },
                        { value: 535, name: 'Safari' },
                        { value: 1700, name: '其它浏览器' }
                    ]
                }]
            },

            //新增的用户量
            {
                title: {
                    text: '最近一周新增的用户量',
                    x: 'center',
                    textStyle: {
                        fontSize: 14
                    }
                },
                tooltip: { //提示框
                    trigger: 'axis',
                    formatter: "{b}<br>新增用户：{c}"
                },
                xAxis: [{ //X轴
                    type: 'category',
                    data: ['11-07', '11-08', '11-09', '11-10', '11-11', '11-12', '11-13']
                }],
                yAxis: [{  //Y轴
                    type: 'value'
                }],
                series: [{ //内容
                    type: 'line',
                    data: [200, 300, 400, 610, 150, 270, 380],
                }]
            }
        ]
            , elemDataView = $('#LAY-index-dataview').children('div')
            , renderDataView = function (index) {
                echartsApp[index] = echarts.init(elemDataView[index], layui.echartsTheme);
                echartsApp[index].setOption(options[index]);
                //window.onresize = echartsApp[index].resize;
                admin.resize(function () {
                    echartsApp[index].resize();
                });
            };


        //没找到DOM，终止执行
        if (!elemDataView[0]) return;

        renderDataView(0);

        //监听数据概览轮播
        var carouselIndex = 0;
        carousel.on('change(LAY-index-dataview)', function (obj) {
            renderDataView(carouselIndex = obj.index);
        });

        //监听侧边伸缩
        layui.admin.on('side', function () {
            setTimeout(function () {
                renderDataView(carouselIndex);
            }, 300);
        });

        //监听路由
        layui.admin.on('hash(tab)', function () {
            layui.router().path.join('') || renderDataView(carouselIndex);
        });
    });

    layui.use(['table', 'setter'], function () {
        var $ = layui.$
            , table = layui.table
            , setter = layui.setter;

        //今日热搜
        table.render({
            elem: '#LAY-index-topSearch'
            , url: setter.apiAddress.announcements.pagelist
            , page: true
            , cols: [[
                { type: 'numbers', fixed: 'left' },
                {
                    field: 'status', title: '标题',
                    templet: function (d) {
                        return '<a href="#/operationservice/announcements/details/id=' + d.id + '">' + d.title + '</a>';
                    }
                },
                { field: 'createTime', width: 200, align: 'center', title: '时间' },
            ]]
            , skin: 'line'
            , page: true
            , cellMinWidth: 80
            , text: {
                none: '暂无相关数据'
            }
            , response: {
                statusCode: 200
            }
            , parseData: function (res) {
                return {
                    "code": res.statusCode,
                    "msg": res.message,
                    "count": res.data.totalCount,
                    "data": res.data.items
                };
            }
        });

        //今日热贴
        table.render({
            elem: '#LAY-index-topCard'
            , url: ''
            , page: true
            , cellMinWidth: 120
            , cols: [[
                { type: 'numbers', fixed: 'left' }
                , { field: 'title', title: '标题', minWidth: 300, templet: '<div><a href="{{ d.href }}" target="_blank" class="layui-table-link">{{ d.title }}</div>' }
                , { field: 'username', title: '发帖者' }
                , { field: 'channel', title: '类别' }
                , { field: 'crt', title: '点击率', sort: true }
            ]]
            , skin: 'line'
        });
    });

    exports('console', {})
});