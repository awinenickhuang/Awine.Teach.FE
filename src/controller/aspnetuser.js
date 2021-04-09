/**
 @Name：用户管理
 */
layui.define(['table', 'form', 'setter', 'verification'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , setter = layui.setter
        , form = layui.form;
    //加载用户数据
    table.render({
        elem: '#userprofile-table'
        , url: setter.apiAddress.aspnetuser.pagelist
        , toolbar: '#userprofile-toolbar'
        , cols: [[
            { field: 'userName', title: '姓名', align: 'left' },
            { field: 'account', title: '账号', align: 'left' },
            { field: 'tenantName', title: '机构', align: 'left' },
            { field: 'departmentName', title: '部门', align: 'left' },
            { field: 'aspnetRoleName', title: '角色', align: 'left' },
            { field: 'phoneNumber', title: '电话', align: 'left' },
            {
                field: 'lockoutEnabled', title: '可否锁定', align: 'center',
                templet: function (d) {
                    if (d.lockoutEnabled) {
                        return '<span style="color:#009688;">是</span>';
                    }
                    else {
                        return '<span style="color:#FF5722;">否</span>';
                    }
                }
            },
            {
                field: 'isActive', title: '用户状态', align: 'center',
                templet: function (d) {
                    if (d.lockoutEnabled) {
                        if (d.isActive) {
                            return '<input type="checkbox" name="isActive" lay-skin="switch" checked="" lay-text="启用|停用" value= ' + d.id + ' lay-filter="user-active-switch" >';
                        } else {
                            return '<input type="checkbox" name="isActive" lay-skin="switch" lay-text="启用|停用" value= ' + d.id + ' lay-filter="user-active-switch" >';
                        }
                    }
                    else {
                        if (d.isActive) {
                            return '<input type="checkbox" disabled="disabled" name="isActive" lay-skin="switch" checked="" lay-text="启用|停用" value= ' + d.id + ' lay-filter="" >';
                        } else {
                            return '<input type="checkbox" disabled="disabled" name="isActive" lay-skin="switch" lay-text="启用|停用" value= ' + d.id + ' lay-filter="" >';
                        }
                    }
                }
            },
            { field: 'createTime', width: 200, title: '创建时间', align: 'center' },
            {
                width: 160, title: '操作', align: 'center'
                , templet: function (d) {
                    var htmlButton = new Array();
                    htmlButton.push('<div class="layui-btn-group">')
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="edit"><i class="layui-icon layui-icon-edit"></i>编辑</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="resetpassword"><i class="layui-icon layui-icon-password"></i>重置密码</a>');
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

    //监听启用状态开关
    form.on('switch(user-active-switch)', function (data) {
        var checked = data.elem.checked;
        //得到美化后的DOM对象 data.othis
        var message = '确定' + (checked ? '启用' : '禁用') + '吗?';
        data.elem.checked = !check;
        form.render();

        admin.req({
            url: setter.apiAddress.aspnetuser.enableordisable
            , data: { Id: data.value, isActive: checked }
            , type: 'POST'
            , done: function (res) {
                if (res.statusCode == 200) {
                    if (checked) {
                        data.elem.checked = checked;
                        layer.tips('提示：启用成功', data.othis, { tips: [2, '#FFB800'] });
                    } else {
                        layer.tips('提示：禁用成功', data.othis, { tips: [2, '#FFB800'] });
                    }
                    layui.table.reload('userprofile-table');
                } else {
                    var em = $(data.othis[0]);
                    data.othis[0].classList.remove('layui-form-onswitch');
                    em.children('em').checked = checked;
                }
                form.render();
            }
        });
    });

    //头工具栏事件
    table.on('toolbar(userprofile-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        console.log(checkStatus);
        switch (obj.event) {
            case 'search':
                admin.popupRight({
                    title: '搜索'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('foundational/aspnetuser/search').done(function () {
                            //机构
                            admin.req({
                                url: setter.apiAddress.tenant.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-organization-list").empty();
                                    $("#sel-organization-list").append("<option value=\"\">请选择机构</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-organization-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            form.on('select(organization-list-filter)', function (data) {
                                //部门
                                $("#sel-department-list").empty();
                                admin.req({
                                    url: setter.apiAddress.department.list
                                    , data: { tenantId: data.tenantId }
                                    , done: function (res) {
                                        $("#sel-department-list").append("<option value=\"\">请选择部门</option>");
                                        $.each(res.data, function (index, item) {
                                            $("#sel-department-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                        });
                                        form.render("select");
                                    }
                                });
                                //角色
                                $("#sel-aspnetrole-list").empty();
                                admin.req({
                                    url: setter.apiAddress.awinerole.list
                                    , data: { tenantId: data.value }
                                    , done: function (res) {
                                        $("#sel-aspnetrole-list").append("<option value=\"\">请选择角色</option>");
                                        $.each(res.data, function (index, item) {
                                            $("#sel-aspnetrole-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                        });
                                        form.render("select");
                                    }
                                });
                            });
                            //监听提交//搜索
                            form.on('submit(aspnetuser-search-submit)', function (data) {
                                var field = data.field;
                                layer.close(index);
                                //执行重载
                                table.reload('userprofile-table', {
                                    where: {
                                        userName: field.name,
                                        tenantId: field.organizationId,
                                        departmentId: field.departmentId,
                                        roleId: field.roleId
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
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('foundational/aspnetuser/add').done(function () {
                            form.render();
                            $("#sel-aspnetRole-list").append("<option value=\"\">请选择角色</option>");
                            $("#sel-department-list").append("<option value=\"\">请选择部门</option>");
                            admin.req({
                                url: setter.apiAddress.tenant.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-organization-list").append("<option value=\"\">请选择机构</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-organization-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //机构选择加载角色及部门
                            form.on('select(organization-add-filter)', function (data) {
                                $("#sel-aspnetRole-list").empty();
                                admin.req({
                                    url: setter.apiAddress.awinerole.list
                                    , data: { tenantId: data.value }
                                    , done: function (res) {
                                        $("#sel-aspnetRole-list").append("<option value=\"\">请选择角色</option>");
                                        $.each(res.data, function (index, item) {
                                            $("#sel-aspnetRole-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                        });
                                        form.render("select");
                                    }
                                });
                                $("#sel-department-list").empty();
                                admin.req({
                                    url: setter.apiAddress.department.list
                                    , data: { tenantId: data.value }
                                    , done: function (res) {
                                        $("#sel-department-list").append("<option value=\"\">请选择部门</option>");
                                        $.each(res.data, function (index, item) {
                                            $("#sel-department-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                        });
                                        form.render("select");
                                    }
                                });
                            });
                            //监听提交
                            form.on('submit(userprofile-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.aspnetuser.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('userprofile-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    //编辑&修改状态
    table.on('tool(userprofile-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'edit') {
            admin.popupRight({
                title: '编辑'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('foundational/aspnetuser/edit', data).done(function () {
                        form.render();
                        //初始机构数据
                        admin.req({
                            url: setter.apiAddress.tenant.list
                            , data: {}
                            , done: function (res) {
                                $("#sel-organization-edit").append("<option value=\"\">请选择机构</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.tenantId == item.id) {
                                        $("#sel-organization-edit").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-organization-edit").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            }
                        });
                        //初始化角色
                        admin.req({
                            url: setter.apiAddress.awinerole.list
                            , data: { tenantId: data.tenantId }
                            , done: function (res) {
                                $("#sel-aspnetrole-edit").append("<option value=\"\">请选择角色</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.roleId == item.id) {
                                        $("#sel-aspnetrole-edit").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-aspnetrole-edit").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            }
                        });
                        //初始化部门
                        admin.req({
                            url: setter.apiAddress.department.list
                            , data: { tenantId: data.tenantId }
                            , done: function (res) {
                                $("#sel-department-edit").append("<option value=\"\">请选择部门</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.departmentId == item.id) {
                                        $("#sel-department-edit").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-department-edit").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            }
                        });

                        $('#sel-gender-edit').val(data.gender);

                        //角色数据响应机构下拉事件
                        form.on('select(sel-organization-edit-filter)', function (data) {
                            $("#sel-aspnetrole-edit").empty();
                            admin.req({
                                url: setter.apiAddress.awinerole.list
                                , data: { tenantId: data.value }
                                , done: function (res) {
                                    $("#sel-aspnetrole-edit").append("<option value=\"\">请选择角色</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-aspnetrole-edit").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                        });

                        //监听提交
                        form.on('submit(userprofile-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.aspnetuser.update
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    table.reload('userprofile-table');
                                }
                            });
                        });
                    });
                }
            });
        } else if (obj.event === 'resetpassword') {
            admin.popupRight({
                title: '重置密码'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('foundational/aspnetuser/resetpassword', data).done(function () {
                        form.render();
                        form.on('submit(user-reset-password-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.aspnetuser.resetpassword
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    layer.msg(res.msg);
                                }
                            });
                        });
                    });
                }
            });
        }
    });

    exports('aspnetuser', {})
});