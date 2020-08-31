/**
 @Name：角色管理
 */
layui.define(['table', 'form', 'common', 'setter', 'element', 'verification', 'treeGrid'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , form = layui.form
        , treeGrid = layui.treeGrid
        , element = layui.element;

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
                admin.popup({
                    title: '角色搜索'
                    , area: ['50%', '30%']
                    , resize: false
                    , success: function (layero, index) {
                        view(this.id).render('foundational/aspnetrole/search').done(function () {
                            //初始机构数据
                            common.ajax(setter.apiAddress.tenant.list, "Get", "", {}, function (res) {
                                $("#sel-organization-search").append("<option value=\"\">请选择机构</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-organization-search").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                });
                                form.render("select");
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
                admin.popup({
                    title: '添加'
                    , area: ['30%', '30%']
                    , resize: false
                    , success: function (layero, index) {
                        view(this.id).render('foundational/aspnetrole/add').done(function () {
                            //初始机构数据
                            common.ajax(setter.apiAddress.tenant.list, "GET", "", "", function (res) {
                                $("#sel-organization-list").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-organization-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            });
                            //监听提交
                            form.on('submit(awinerole-form-submit)', function (data) {
                                common.ajax(setter.apiAddress.awinerole.add, "POST", "", $('#awinerole-add-form').serialize(), function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        table.reload('awinerole-table');
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
            common.ajax(setter.apiAddress.awinebutton.btnlist, "Get", "", "", function (res) {
                operationPermissions.buttons = res.data;
                operationPermissions.initOperationPermissionsTable(role);
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
                , idField: 'id'
                , treeId: 'id'
                , treeUpId: 'parentId'
                , treeShowName: 'name'
                , isFilter: false
                , iconOpen: false
                , isOpenDefault: true
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
                    common.ajax(setter.apiAddress.aspnetroleclaims.list, "Get", "", { roleId: role }, function (res) {
                        $.each(res.data, function (index, item) {
                            var permission = {
                                claimValue: item.claimValue
                            };
                            operationPermissions.rolePermissionsArray.roleClaims.push(permission);
                            $("input[type='checkbox'][value='" + item.claimValue + "']").prop("checked", true);
                            form.render('checkbox');
                        });
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
                common.ajax(setter.apiAddress.awinerole.delete, "POST", "", { Id: data.id }, function (res) {
                    if (res.statusCode == 200) {
                        layer.close(index);
                        table.reload('awinerole-table');
                    }
                    layer.msg(res.message);
                });
            });
        } else if (obj.event === 'edit') {
            admin.popup({
                title: '修改'
                , area: ['30%', '30%']
                , resize: false
                , success: function (layero, index) {
                    view(this.id).render('foundational/aspnetrole/edit', data).done(function () {
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
                        form.render();
                        form.on('submit(awinerole-edit-form-submit)', function (data) {
                            common.ajax(setter.apiAddress.awinerole.update, "POST", "", data.field, function (res) {
                                if (res.statusCode == 200) {
                                    layer.close(index);
                                    table.reload('awinerole-table');
                                }
                                layer.msg(res.message);
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
                        treeGrid.set({ headers: { Authorization: "Bearer " + sessionStorage.access_token } });
                        operationPermissions.initOperationPermissions(data.id);
                        //监听保存操作权限事件
                        $('.layui-btn.btn-save-operationpermissions').on('click', function () {
                            var selected = layui.treeGrid.checkStatus("operationpermissions-table").data;
                            operationPermissions.rolePermissionsArray.rolesOwnedModules.splice(0, operationPermissions.rolePermissionsArray.rolesOwnedModules.length);

                            $.each(selected, function (index, item) {
                                operationPermissions.rolePermissionsArray.rolesOwnedModules.push({ moduleId: item.id });
                            });

                            operationPermissions.rolePermissionsArray.roleId = data.id;

                            common.ajax(setter.apiAddress.awinerole.saveroleownedmodules, "POST", "", { model: operationPermissions.rolePermissionsArray }, function (res) {
                                layer.msg(res.message);
                            });
                        });
                    });
                }
            });
        }
    });

    exports('aspnetrole', {})
});