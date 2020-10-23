/**
 @Name：教室管理
 */
layui.define(['table', 'form', 'setter', 'verification'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , setter = layui.setter
        , form = layui.form;
    table.render({
        elem: '#classroom-table'
        , url: setter.apiAddress.classroom.pagelist
        , toolbar: '#classroom-toolbar'
        , cols: [[
            { field: 'name', title: '教室名称' },
            { field: 'noteContent', title: '备注信息' },
            { field: 'displayOrder', width: 100, align: 'center', title: '显示顺序' },
            { field: 'createTime', width: 200, align: 'center', title: '创建时间' },
            {
                width: 200,
                title: '操作',
                align: 'center',
                templet: function (d) {
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
    table.on('toolbar(classroom-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'add':
                admin.popup({
                    title: '添加'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['40%', '40%']
                    , resize: false
                    , success: function (layero, index) {
                        view(this.id).render('teaching/classroom/add').done(function () {
                            //监听提交
                            form.on('submit(classroom-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.classroom.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('classroom-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    table.on('tool(classroom-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                admin.req({
                    url: setter.apiAddress.classroom.delete
                    , data: { Id: data.id }
                    , type: 'POST'
                    , done: function (res) {
                        layer.close(index);
                        table.reload('classroom-table');
                    }
                });
            });
        } else if (obj.event === 'edit') {
            admin.popup({
                title: '修改'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['40%', '40%']
                , resize: false
                , success: function (layero, index) {
                    view(this.id).render('teaching/classroom/edit', data).done(function () {
                        form.render();
                        form.on('submit(classroom-edit-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.classroom.update
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    table.reload('classroom-table');
                                }
                            });
                        });
                    });
                }
            });
        }
    });

    exports('classroom', {})
});