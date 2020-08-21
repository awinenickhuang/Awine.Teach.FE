﻿/**
 @Name：行业数据字典管理
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

    table.render({
        elem: '#financialitems-table'
        , url: setter.apiAddress.financialitems.pagelist
        , toolbar: '#financialitems-toolbar'
        , cols: [[
            { field: 'name', title: '名称' },
            {
                field: 'status', title: '状态', align: 'center', width: 100,
                templet: function (d) {
                    switch (d.status) {
                        case 1:
                            return '<input type="checkbox" name="status" lay-skin="switch" checked="" lay-text="启用|停用" value= ' + d.id + ' lay-filter="item-enabled-status-filter" >';
                            break;
                        case 2:
                            return '<input type="checkbox" name="status" lay-skin="switch" lay-text="启用|停用" value= ' + d.id + ' lay-filter="item-enabled-status-filter" >';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            { field: 'displayOrder', width: 100, align: 'center', title: '显示顺序' },
            { field: 'createTime', width: 200, align: 'center', title: '创建时间' },
            {
                width: 150,
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

    //监听启用状态开关
    form.on('switch(item-enabled-status-filter)', function (data) {
        var enabledStatus = this.checked ? 1 : 2;
        if (enabledStatus == 1) {
            layer.tips('提示：启用', data.othis, { tips: [2, '#FFB800'] })
        }
        if (enabledStatus == 2) {
            layer.tips('提示：停用', data.othis, { tips: [2, '#FFB800'] })
        }
        common.ajax(setter.apiAddress.financialitems.updatestatus, "POST", "", { Id: data.value, status: enabledStatus }, function (res) {
            if (res.statusCode == 200) {
                layui.table.reload('financialitems-table');
            }
            layer.msg(res.message);
        });
    });

    //头工具栏事件
    table.on('toolbar(financialitems-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'add':
                admin.popup({
                    title: '添加'
                    , area: ['30%', '35%']
                    , resize: false
                    , success: function (layero, index) {
                        view(this.id).render('financialservice/financialitems/add').done(function () {
                            form.render();
                            //监听提交
                            form.on('submit(financialitems-form-submit)', function (data) {
                                common.ajax(setter.apiAddress.financialitems.add, "POST", "", data.field, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        table.reload('financialitems-table');
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

    table.on('tool(financialitems-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                common.ajax(setter.apiAddress.financialitems.delete, "POST", "", { Id: data.id }, function (res) {
                    if (res.statusCode == 200) {
                        layer.close(index);
                        table.reload('financialitems-table');
                    }
                    layer.msg(res.message);
                });
            });
        }
    });

    exports('financialitems', {})
});