/**
 @Name：部门管理
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

    form.render(null, 'department-search-form');

    //搜索
    form.on('submit(department-search)', function (data) {
        var field = data.field;
        //执行重载
        table.reload('department-table', {
            where: {
                tenantId: $("#organization-search-sel").val(),
            },
            page: {
                curr: 1 //重新从第 1 页开始
            }
        });
    });

    common.ajax(setter.apiAddress.tenant.list, "Get", "", {}, function (res) {
        $("#organization-search-sel").append("<option value=\"\">请选择机构</option>");
        $.each(res.data, function (index, item) {
            $("#organization-search-sel").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
        });
        form.render("select");
    });

    table.render({
        elem: '#department-table'
        , url: setter.apiAddress.department.pagelist
        , toolbar: '#department-toolbar'
        , cols: [[
            { field: 'name', title: '部门' },
            { field: 'tenantName', title: '机构' },
            { field: 'describe', title: '描述' },
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
    table.on('toolbar(department-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'add':
                admin.popup({
                    title: '添加'
                    , area: ['30%', '45%']
                    , resize: false
                    , success: function (layero, index) {
                        view(this.id).render('foundationalservice/department/add').done(function () {
                            //初始机构数据
                            common.ajax(setter.apiAddress.tenant.list, "GET", "", "", function (res) {
                                $("#sel-organization-list").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-organization-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            });
                            //监听提交
                            form.on('submit(department-form-submit)', function (data) {
                                common.ajax(setter.apiAddress.department.add, "POST", "JSON", data.field, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        table.reload('department-table');
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

    table.on('tool(department-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                common.ajax(setter.apiAddress.department.delete, "POST", "", { Id: data.id }, function (res) {
                    if (res.statusCode == 200) {
                        layer.close(index);
                        table.reload('department-table');
                    }
                    layer.msg(res.message);
                });
            });
        } else if (obj.event === 'edit') {
            admin.popup({
                title: '修改'
                , area: ['30%', '45%']
                , resize: false
                , success: function (layero, index) {
                    view(this.id).render('foundationalservice/department/edit', data).done(function () {
                        form.render();
                        //初始机构数据
                        common.ajax(setter.apiAddress.tenant.list, "GET", "", "", function (res) {
                            $("#sel-organization-list").append("<option value=\"\">请选择</option>");
                            $.each(res.data, function (index, item) {
                                if (data.tenantId == item.id) {
                                    $("#sel-organization-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                } else {
                                    $("#sel-organization-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                }
                            });
                            form.render("select");
                        });
                        form.on('submit(department-edit-form-submit)', function (data) {
                            common.ajax(setter.apiAddress.department.update, "POST", "", data.field, function (res) {
                                if (res.statusCode == 200) {
                                    layer.close(index);
                                    table.reload('department-table');
                                }
                                layer.msg(res.message);
                            });
                        });
                    });
                }
            });
        }
    });

    exports('department', {})
});