/**
 @Name：角色管理
 */
layui.define(['table', 'form', 'setter', 'verification', 'treeGrid'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , setter = layui.setter
        , form = layui.form
        , treeGrid = layui.treeGrid;
    //加载角色数据
    table.render({
        elem: '#awinerole-table'
        , url: setter.apiAddress.awinerole.pagelist
        , toolbar: '#awinerole-toolbar'
        , cols: [[
            { field: 'name', title: '角色' },
            { field: 'tenantName', title: '机构' },
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
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="operationpermissions"><i class="layui-icon layui-icon-set"></i>权限</a>');
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
    table.on('toolbar(awinerole-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'search':
                admin.popupRight({
                    title: '搜索'
                    , area: ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('foundational/aspnetrole/search').done(function () {
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
                            form.on('submit(aspnetrole-search-submit)', function (data) {
                                var field = data.field;
                                layer.close(index);
                                //执行重载
                                table.reload('awinerole-table', {
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
                        view(this.id).render('foundational/aspnetrole/add').done(function () {
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
                            form.on('submit(awinerole-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.awinerole.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('awinerole-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    //-----------------角色操作权限相关代码-----Start------------

    var operationPermissions = {
        buttons: [],
        rolePermissionsArray: {
            roleId: "",
            rolesOwnedModules: [],
            roleClaims: []
        },
        initOperationPermissions: function (role) {
            //初始化表格前先加载所有按钮，避免表格完成渲染完成后没有按钮的问题
            admin.req({
                url: setter.apiAddress.awinebutton.btnlist
                , data: {}
                , done: function (res) {
                    operationPermissions.buttons = res.data;
                    operationPermissions.initOperationPermissionsTable(role);
                }
            });
            form.on('checkbox(button-permission-filter)', function (data) {
                var current = {
                    claimValue: data.value
                };
                if (data.elem.checked) {
                    operationPermissions.rolePermissionsArray.roleClaims.push(current);
                } else {
                    var tempArray = [];
                    $.each(operationPermissions.rolePermissionsArray.roleClaims, function (index, item) {
                        if (item.claimValue != current.claimValue) {
                            tempArray.push(item);
                        }
                    });
                    operationPermissions.rolePermissionsArray.roleClaims = tempArray;
                }
            });

        },
        generateButtons: function (moduleId) {
            var buttonArr = [];
            $.each(operationPermissions.buttons, function (index, item) {
                if (item.moduleId == moduleId) {
                    buttonArr.push('<input value="' + item.accessCode + '" lay-filter="button-permission-filter" class="' + moduleId + '" moduleId="' + moduleId + '" id="btn_' + item.id + '" type="checkbox" buttonId="' + item.id + '" title="' + item.name + '">&nbsp;&nbsp;');
                }
            });
            return buttonArr;
        },
        initOperationPermissionsTable: function (role) {
            //初始化角色权限的系统模块树型表格
            treeGrid.config.cols.isCheckName = 'checked';
            treeGrid.render({
                id: "operationpermissions-table"
                , elem: '#operationpermissions-table'
                , url: setter.apiAddress.awinemodule.listwithchedkedstatus
                , headers: {
                    Authorization: "Bearer " + layui.data(setter.tableName)[setter.request.tokenName]
                }
                , idField: 'id'
                , treeId: 'id'
                , treeUpId: 'parentId'
                , treeShowName: 'name'
                , isFilter: false
                , iconOpen: false
                , isOpenDefault: false
                , loading: true
                , method: 'get'
                , isPage: false
                , height: 'full-320'
                , cellMinWidth: 80
                , cols: [[
                    { type: 'checkbox' },
                    { field: 'name', title: '系统模块', sort: false, width: 200 },
                    {
                        field: 'id', title: '操作权限',
                        templet: function (d) {
                            return operationPermissions.generateButtons(d.id).join('');
                        }
                    }
                ]]
                , done: function (res, page, count) {
                    operationPermissions.rolePermissionsArray.roleClaims.splice(0, operationPermissions.rolePermissionsArray.roleClaims.length);
                    admin.req({
                        url: setter.apiAddress.aspnetroleclaims.list
                        , data: { roleId: role }
                        , done: function (res) {
                            $.each(res.data, function (index, item) {
                                var permission = {
                                    claimValue: item.claimValue
                                };
                                operationPermissions.rolePermissionsArray.roleClaims.push(permission);
                                $("input[type='checkbox'][value='" + item.claimValue + "']").prop("checked", true);
                                form.render('checkbox');
                            });
                        }
                    });
                }
                , where: {
                    roleId: role
                }
                , parseData: function (res) {
                    return {
                        "code": 0,
                        "msg": res.message,
                        "data": res.data
                    };
                }
            });
        }
    };

    //-----------------角色操作权限相关代码-----End------------

    table.on('tool(awinerole-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                admin.req({
                    url: setter.apiAddress.awinerole.delete
                    , data: { Id: data.id }
                    , type: 'POST'
                    , done: function (res) {
                        layer.close(index);
                        table.reload('awinerole-table');
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
                    view(this.id).render('foundational/aspnetrole/edit', data).done(function () {
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
                        form.render();
                        form.on('submit(awinerole-edit-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.awinerole.update
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    table.reload('awinerole-table');
                                }
                            });
                        });
                    });
                }
            });
        } else if (obj.event === 'operationpermissions') {
            admin.popupRight({
                id: 'LAY_operationPermissions'
                , title: '操作权限设置'
                , area: ['60%', '100%']
                , resize: true
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('foundational/aspnetrole/operationpermissions').done(function () {
                        operationPermissions.initOperationPermissions(data.id);
                        //监听保存操作权限事件
                        $('.layui-btn.btn-save-operationpermissions').on('click', function () {
                            var selected = layui.treeGrid.checkStatus("operationpermissions-table").data;
                            operationPermissions.rolePermissionsArray.rolesOwnedModules.splice(0, operationPermissions.rolePermissionsArray.rolesOwnedModules.length);

                            $.each(selected, function (index, item) {
                                operationPermissions.rolePermissionsArray.rolesOwnedModules.push({ moduleId: item.id });
                            });

                            operationPermissions.rolePermissionsArray.roleId = data.id;

                            admin.req({
                                url: setter.apiAddress.awinerole.saveroleownedmodules
                                , data: { model: operationPermissions.rolePermissionsArray }
                                , type: 'POST'
                                , done: function (res) {
                                    layer.msg(res.msg, { icon: 1 });
                                }
                            });
                        });
                    });
                }
            });
        }
    });

    exports('aspnetrole', {})
});