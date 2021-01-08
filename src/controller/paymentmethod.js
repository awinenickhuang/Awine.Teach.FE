/**
 @Name：收款方式
 */
layui.define(['table', 'form', 'setter', 'verification'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , setter = layui.setter
        , form = layui.form;
    table.render({
        elem: '#paymentmethod-table'
        , url: setter.apiAddress.paymentmethod.pagelist
        , toolbar: '#paymentmethod-toolbar'
        , cols: [[
            { field: 'name', align: 'center', title: '收款方式' },
            { field: 'displayOrder', align: 'center', title: '显示顺序' },
            { field: 'noteInformation', align: 'center', title: '备注信息' },
            { field: 'createTime', align: 'center', title: '创建时间' },
            {
                width: 150, title: '操作', align: 'center'
                , templet: function (d) {
                    var htmlButton = new Array();
                    htmlButton.push('<div class="layui-btn-group">')
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="edit"><i class="layui-icon layui-icon-edit"></i>编辑</a>');
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
    table.on('toolbar(paymentmethod-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'add':
                admin.popup({
                    title: '添加'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['40%', '40%']
                    , resize: false
                    , success: function (layero, index) {
                        view(this.id).render('teaching/paymentmethod/add').done(function () {
                            form.render();
                            //监听提交
                            form.on('submit(paymentmethod-add-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.paymentmethod.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('paymentmethod-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    table.on('tool(paymentmethod-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                admin.req({
                    url: setter.apiAddress.paymentmethod.delete
                    , data: { Id: data.id }
                    , type: 'POST'
                    , done: function (res) {
                        layer.close(index);
                        table.reload('paymentmethod-table');
                    }
                });
            });
        } else if (obj.event === 'edit') {
            admin.popup({
                title: '修改'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['40%', '40%']
                , resize: false
                , success: function (layero, index) {
                    view(this.id).render('teaching/paymentmethod/edit', data).done(function () {
                        form.render();
                        form.on('submit(paymentmethod-edit-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.paymentmethod.update
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    table.reload('paymentmethod-table');
                                }
                            });
                        });
                    });
                }
            });
        }
    });

    exports('paymentmethod', {})
});