/**
 @Name：日常支出
 */
layui.define(['table', 'form', 'common', 'setter', 'verification', 'laydate'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , form = layui.form
        , laydate = layui.laydate;
    //加载日常支出
    table.render({
        elem: '#dailyspending-table'
        , url: setter.apiAddress.dailyspending.pagelist
        , toolbar: '#dailyspending-toolbar'
        , totalRow: true
        , cols: [[
            { field: 'name', title: '名称', fixed: 'left', unresize: true, totalRowText: '<span style="color:#FF5722;">支出合计（元）</span>' },
            //{ field: 'name', title: '名称' },
            {
                field: 'amount', title: '金额', totalRow: true,
                templet: function (d) {
                    return common.fixedMoney(d.amount);
                }
            },
            { field: 'financialItemName', title: '项目', align: 'center' },
            { field: 'createTime', align: 'center', title: '创建时间' },
            {
                width: 100,
                title: '操作',
                align: 'center',
                templet: function (d) {
                    var htmlButton = new Array();
                    htmlButton.push('<div class="layui-btn-group">')
                    htmlButton.push('<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del"><i class="layui-icon layui-icon-delete"></i>删除</a>');
                    htmlButton.push('</div>')
                    return htmlButton.join('');
                }
            }
        ]]
        , page: true
        , cellMinWidth: 80
        , height: 'full-160'
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

    //头工具栏事件
    table.on('toolbar(dailyspending-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'search':
                admin.popupRight({
                    title: '日常支出搜索'
                    , area: ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('financial/dailyspending/search').done(function () {
                            //初始化日期范围
                            laydate.render({
                                elem: '#daterange'
                                , range: true
                                , done: function (value, date, endDate) {
                                    if (!value) {
                                        $("#dailyspending-statr-time").val('');
                                        $("#dailyspending-end-time").val('');
                                    } else {
                                        $("#dailyspending-statr-time").val(date.year + "-" + date.month + "-" + date.date);
                                        $("#dailyspending-end-time").val(endDate.year + "-" + endDate.month + "-" + endDate.date);
                                    }
                                }
                            });
                            //初始支出项目
                            admin.req({
                                url: setter.apiAddress.financialitems.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-financialitems-search-list").append("<option value=\"\">请选择支出项目</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-financialitems-search-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //监听提交//搜索
                            form.on('submit(dailyspending-search-submit)', function (data) {
                                var field = data.field;
                                layer.close(index);
                                //执行重载
                                table.reload('dailyspending-table', {
                                    where: {
                                        beginDate: field.beginDate,
                                        finishDate: field.finishDate,
                                        financialItemId: field.financialitemsId,
                                    },
                                    page: {
                                        curr: 1 //重新从第 1 页开始
                                    }
                                });
                            });
                        });
                    }
                });
                break;
            case 'add':
                admin.popupRight({
                    title: '添加'
                    , area: ['35%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('financial/dailyspending/add').done(function () {
                            $("#sel-financialitem-list").empty();
                            admin.req({
                                url: setter.apiAddress.financialitems.list
                                , data: { status: 1 }
                                , done: function (res) {
                                    $("#sel-financialitem-list").append("<option value=\"\">请选择项目</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-financialitem-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            form.render();
                            //监听提交
                            form.on('submit(dailyspending-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.dailyspending.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('dailyspending-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    table.on('tool(dailyspending-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                admin.req({
                    url: setter.apiAddress.dailyspending.delete
                    , data: { Id: data.id }
                    , type: 'POST'
                    , done: function (res) {
                        layer.close(index);
                        table.reload('dailyspending-table');
                    }
                });
            });
        }
    });

    exports('dailyspending', {})
});