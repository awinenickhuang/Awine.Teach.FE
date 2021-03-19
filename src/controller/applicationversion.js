/**
 @Name：应用版本管理
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
        elem: '#applicationversion-table'
        , url: setter.apiAddress.applicationversion.pagelist
        , toolbar: '#applicationversion-toolbar'
        , cols: [[
            { field: 'name', title: '应用版本' },
            {
                field: 'identifying', title: '版本标识', align: 'center',
                templet: function (d) {
                    switch (d.identifying) {
                        case 1:
                            return '<span style="color:#009688;">免费</span>';
                            break;
                        case 2:
                            return '<span style="color:#FF5722;">试用</span>';
                            break;
                        case 3:
                            return '<span style="color:#FFB800;">VIP</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            { field: 'displayOrder', title: '显示顺序' },
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
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="modules"><i class="layui-icon layui-icon-set"></i>模块</a>');
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
    table.on('toolbar(applicationversion-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'add':
                admin.popupRight({
                    title: '添加'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('operation/appversion/add').done(function () {
                            form.render();
                            //监听提交
                            form.on('submit(applicationversion-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.applicationversion.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('applicationversion-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    //-----------------应用版本包括的模块相关代码-----Start------------

    var appVersionOwnedModules = {
        appVersionOwnedModulesArray: {
            appVersionId: "",
            appVersionOwnedModules: []
        },
        initModulesTable: function (appVersionId) {
            treeGrid.config.cols.isCheckName = 'checked';
            treeGrid.render({
                id: "appversionownedmodules-table"
                , elem: '#appversionownedmodules-table'
                , url: setter.apiAddress.awinemodule.listwithchedkedstatusforappversion
                , headers: {
                    Authorization: "Bearer " + layui.data(setter.tableName)[setter.request.tokenName]
                }
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
                    { field: 'name', title: '系统模块', sort: false, width: 200 }
                ]]
                , where: {
                    appVersionId: appVersionId
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

    //-----------------应用版本包括的模块相关代码-----End------------

    table.on('tool(applicationversion-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                admin.req({
                    url: setter.apiAddress.applicationversion.delete
                    , data: { Id: data.id }
                    , type: 'POST'
                    , done: function (res) {
                        layer.close(index);
                        table.reload('applicationversion-table');
                    }
                });
            });
        } else if (obj.event === 'edit') {
            admin.popupRight({
                title: '修改'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('operation/appversion/edit', data).done(function () {
                        $('#sel-identifying-list').val(data.identifying);
                        form.render();
                        form.on('submit(applicationversion-edit-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.applicationversion.update
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    table.reload('applicationversion-table');
                                }
                            });
                        });
                    });
                }
            });
        } else if (obj.event === 'modules') {
            admin.popupRight({
                id: 'LAY_appversionownedmodules'
                , title: '操作权限设置'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['40%', '100%']
                , resize: true
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('operation/appversion/settings').done(function () {
                        //初始化应用版本包括的模块信息列表
                        appVersionOwnedModules.initModulesTable(data.id);
                        //监听保存操作权限事件
                        $('.layui-btn.btn-save-appversionownedmodules').on('click', function () {
                            var selected = layui.treeGrid.checkStatus("appversionownedmodules-table").data;
                            appVersionOwnedModules.appVersionOwnedModulesArray.appVersionOwnedModules.splice(0, appVersionOwnedModules.appVersionOwnedModulesArray.appVersionOwnedModules.length);

                            $.each(selected, function (index, item) {
                                appVersionOwnedModules.appVersionOwnedModulesArray.appVersionOwnedModules.push({ moduleId: item.id });
                            });

                            appVersionOwnedModules.appVersionOwnedModulesArray.appVersionId = data.id;

                            admin.req({
                                url: setter.apiAddress.applicationversionownedmodule.saverappversionownedmodules
                                , data: { model: appVersionOwnedModules.appVersionOwnedModulesArray }
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

    exports('applicationversion', {})
});