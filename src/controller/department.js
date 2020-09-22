/**
 @Name：部门管理
 */
layui.define(['table', 'form', 'setter', 'verification'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , setter = layui.setter
        , form = layui.form;
    //加载机构 -> 部门数据
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
    table.on('toolbar(department-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'search':
                admin.popupRight({
                    title: '搜索'
                    , area: ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('foundational/department/search').done(function () {
                            //初始机构数据
                            admin.req({
                                url: setter.apiAddress.tenant.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-organization-search").append("<option value=\"\">请选择机构</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-organization-search").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //监听提交//搜索
                            form.on('submit(department-search-submit)', function (data) {
                                var field = data.field;
                                layer.close(index);
                                //执行重载
                                table.reload('department-table', {
                                    where: {
                                        tenantId: field.OrganizationId,
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
                    , area: ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('foundational/department/add').done(function () {
                            //初始机构数据
                            admin.req({
                                url: setter.apiAddress.tenant.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-organization-list").append("<option value=\"\">请选择</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-organization-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //监听提交
                            form.on('submit(department-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.department.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('department-table');
                                    }
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
                admin.req({
                    url: setter.apiAddress.department.delete
                    , data: { Id: data.id }
                    , type: 'POST'
                    , done: function (res) {
                        layer.close(index);
                        table.reload('department-table');
                    }
                });
            });
        } else if (obj.event === 'edit') {
            admin.popupRight({
                title: '修改'
                , area: ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('foundational/department/edit', data).done(function () {
                        form.render();
                        //初始机构数据
                        admin.req({
                            url: setter.apiAddress.tenant.list
                            , data: {}
                            , done: function (res) {
                                $("#sel-organization-list").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.tenantId == item.id) {
                                        $("#sel-organization-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-organization-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            }
                        });
                        form.on('submit(department-edit-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.department.update
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    table.reload('department-table');
                                }
                            });
                        });
                    });
                }
            });
        }
    });

    exports('department', {})
});