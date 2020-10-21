/**
 @Name：营销渠道
 */
layui.define(['table', 'form', 'setter', 'verification'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , setter = layui.setter
        , form = layui.form;
    table.render({
        elem: '#marketingchannel-table'
        , url: setter.apiAddress.marketingchannel.pagelist
        , toolbar: '#marketingchannel-toolbar'
        , cols: [[
            { field: 'name', title: '名称' },
            { field: 'describe', title: '描述' },
            { field: 'displayOrder', title: '显示顺序', align: 'center', width: 100 },
            {
                width: 100, title: '操作', align: 'center'
                , templet: function (d) {
                    var htmlButton = new Array();
                    htmlButton.push('<div class="layui-btn-group">')
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="edit"><i class="layui-icon layui-icon-edit"></i>编辑</a>');
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
    table.on('toolbar(marketingchannel-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'add':
                admin.popup({
                    title: '添加'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['40%', '40%']
                    , resize: false
                    , success: function (layero, index) {
                        view(this.id).render('marketing/marketingchannel/add').done(function () {
                            form.render();
                            //监听提交
                            form.on('submit(marketingchannel-add-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.marketingchannel.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('marketingchannel-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    table.on('tool(marketingchannel-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'edit') {
            admin.popup({
                title: '修改'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['40%', '40%']
                , resize: false
                , success: function (layero, index) {
                    view(this.id).render('marketing/marketingchannel/edit', data).done(function () {
                        form.render();
                        form.on('submit(marketingchannel-edit-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.marketingchannel.update
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    table.reload('marketingchannel-table');
                                }
                            });
                        });
                    });
                }
            });
        }
    });

    exports('marketingchannel', {})
});