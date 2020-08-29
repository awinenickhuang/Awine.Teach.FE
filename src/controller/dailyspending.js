/**
 @Name：日常支出
 */
layui.define(['table', 'form', 'common', 'setter', 'element', 'verification'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , form = layui.form
        , element = layui.element;

    form.render();

    table.render({
        elem: '#dailyspending-table'
        , url: setter.apiAddress.dailyspending.pagelist
        , toolbar: '#dailyspending-toolbar'
        , cols: [[
            { field: 'name', title: '名称' },
            {
                field: 'amount', title: '金额',
                templet: function (d) {
                    return common.fixedMoney(d.amount);
                }
            },
            { field: 'displayOrder', title: '项目' },
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
            case 'add':
                admin.popupRight({
                    title: '添加'
                    , area: ['35%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('financial/dailyspending/add').done(function () {
                            $("#sel-financialitem-list").empty();
                            common.ajax(setter.apiAddress.financialitems.list, "GET", "", { status: 1 }, function (res) {
                                $("#sel-financialitem-list").append("<option value=\"\">请选择项目</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-financialitem-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            });
                            form.render();
                            //监听提交
                            form.on('submit(dailyspending-form-submit)', function (data) {
                                common.ajax(setter.apiAddress.dailyspending.add, "POST", "", data.field, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        table.reload('dailyspending-table');
                                    }
                                    layer.msg(res.message);
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
                common.ajax(setter.apiAddress.dailyspending.delete, "POST", "", { Id: data.id }, function (res) {
                    if (res.statusCode == 200) {
                        layer.close(index);
                        table.reload('dailyspending-table');
                    }
                    layer.msg(res.message);
                });
            });
        }
    });

    exports('dailyspending', {})
});