/**
 @Name：应用版本管理
 */
layui.define(['table', 'form', 'setter', 'verification', 'element', 'treeGrid'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , setter = layui.setter
        , form = layui.form
        , element = layui.element
        , treeGrid = layui.treeGrid;

    table.render({
        elem: '#saasversion-table'
        , url: setter.apiAddress.saasversion.pagelist
        , toolbar: '#saasversion-toolbar'
        , cols: [[
            { field: 'name', title: 'SaaS应用版本' },
            {
                field: 'identifying', title: '版本分类', align: 'center',
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
                        case 4:
                            return '<span style="color:#FFB800;">渠道</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            { field: 'displayOrder', title: '显示顺序', align: 'center' },
            { field: 'createTime', width: 200, align: 'center', title: '创建时间' },
            {
                width: 360,
                title: '操作',
                align: 'center',
                templet: function (d) {
                    var htmlButton = new Array();
                    htmlButton.push('<div class="layui-btn-group">')
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="edit"><i class="layui-icon layui-icon-edit"></i>编辑</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del"><i class="layui-icon layui-icon-delete"></i>删除</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="modules"><i class="layui-icon layui-icon-set"></i>模块配置</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="settings"><i class="layui-icon layui-icon-set"></i>参数配置</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="saaspricingtactics"><i class="layui-icon layui-icon-set"></i>定价策略</a>');
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
    table.on('toolbar(saasversion-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'add':
                admin.popupRight({
                    title: '添加'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('operation/saasversion/add').done(function () {
                            form.render();
                            //监听提交
                            form.on('submit(saasversion-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.saasversion.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('saasversion-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    //SaaS版本包括的模块相关代码------Start

    var saaSVersionOwnedModulesSettings = {
        saaSVersionOwnedModulesArray: {
            saaSVersionId: "",
            saaSVersionOwnedModules: []
        },
        initModulesTable: function (saaSVersionId) {
            treeGrid.config.cols.isCheckName = 'checked';
            treeGrid.render({
                id: "saasversionownedmodules-table"
                , elem: '#saasversionownedmodules-table'
                , url: setter.apiAddress.awinemodule.listwithchedkedstatusforsaasversion
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
                    saaSVersionId: saaSVersionId
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

    //SaaS版本包括的模块相关代码------End

    table.on('tool(saasversion-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {//删除
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                admin.req({
                    url: setter.apiAddress.saasversion.delete
                    , data: { Id: data.id }
                    , type: 'POST'
                    , done: function (res) {
                        layer.close(index);
                        table.reload('saasversion-table');
                    }
                });
            });
        } else if (obj.event === 'edit') {//修改
            admin.popupRight({
                title: '修改'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('operation/saasversion/edit', data).done(function () {
                        $('#sel-identifying-list').val(data.identifying);
                        form.render();
                        form.on('submit(saasversion-edit-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.saasversion.update
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    table.reload('saasversion-table');
                                }
                            });
                        });
                    });
                }
            });
        } else if (obj.event === 'modules') {//模块配置
            admin.popupRight({
                id: 'LAY_appversionownedmodules'
                , title: '模块配置'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['40%', '100%']
                , resize: true
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('operation/saasversion/settings').done(function () {
                        //初始化应用版本包括的模块信息列表
                        saaSVersionOwnedModulesSettings.initModulesTable(data.id);
                        //监听保存操作权限事件
                        $('.layui-btn.btn-save-saasversionownedmodules').on('click', function () {
                            var selected = layui.treeGrid.checkStatus("saasversionownedmodules-table").data;
                            saaSVersionOwnedModulesSettings.saaSVersionOwnedModulesArray.saaSVersionOwnedModules.splice(0, saaSVersionOwnedModulesSettings.saaSVersionOwnedModulesArray.saaSVersionOwnedModules.length);

                            $.each(selected, function (index, item) {
                                saaSVersionOwnedModulesSettings.saaSVersionOwnedModulesArray.saaSVersionOwnedModules.push({ moduleId: item.id });
                            });

                            saaSVersionOwnedModulesSettings.saaSVersionOwnedModulesArray.saaSVersionId = data.id;

                            admin.req({
                                url: setter.apiAddress.saasversionownedmodule.saversaasversionownedmodules
                                , data: { model: saaSVersionOwnedModulesSettings.saaSVersionOwnedModulesArray }
                                , type: 'POST'
                                , done: function (res) {
                                    layer.msg(res.msg, { icon: 1 });
                                }
                            });
                        });
                    });
                }
            });
        } else if (obj.event === 'settings') {//参数配置
            //取当前版本的默认参数设置
            admin.req({
                url: setter.apiAddress.tenantdefaultsettings.singlesaasversion
                , data: { saaSVersionId: data.id }
                , type: 'GET'
                , done: function (res) {
                    //渲染窗口
                    admin.popupRight({
                        id: 'LAY_saasversionsettings'
                        , title: '参数配置'
                        , area: admin.screen() < 2 ? ['100%', '100%'] : ['40%', '100%']
                        , resize: true
                        , closeBtn: 1
                        , success: function (layero, index) {
                            view(this.id).render('operation/saasversion/parametersettings', res.data).done(function () {
                                form.render();
                                form.on('submit(parametersettings-edit-form-submit)', function (data) {
                                    admin.req({
                                        url: setter.apiAddress.tenantdefaultsettings.update
                                        , data: data.field
                                        , type: 'POST'
                                        , done: function (res) {
                                            if (res.statusCode === 200) {
                                                layer.close("LAY_saasversionsettings");
                                                layer.msg(res.msg, { icon: 1 });
                                            } else {
                                                layer.msg(res.msg, { icon: 1 });
                                            }
                                        }
                                    });
                                });
                            });
                        }
                    });
                    //渲染窗口
                }
            });
        } else if (obj.event === 'saaspricingtactics') {
            admin.popupRight({
                title: '定价策略'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['50%', '100%']
                , resize: true
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('operation/saasversion/saaspricingtactics', data).done(function (parentIndex) {
                        form.render();

                        table.render({
                            elem: '#saaspricingtactics-table'
                            , url: setter.apiAddress.saaspricingtactics.pagelist
                            , cols: [[
                                { field: 'numberOfYears', title: '购买年数（年）', align: 'center' },
                                { field: 'chargeRates', title: '收费标准（元）', align: 'center' },
                                { field: 'createTime', width: 200, title: '创建时间', align: 'center' },
                                {
                                    width: 120, title: '操作', align: 'center'
                                    , templet: function (d) {
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
                            , height: 'full-160'
                            , text: {
                                none: '暂无数据'
                            }
                            , response: {
                                statusCode: 200
                            }
                            , where: { saaSVersionId: data.id }
                            , parseData: function (res) {
                                return {
                                    "code": res.statusCode,
                                    "msg": res.message,
                                    "count": res.data.totalCount,
                                    "data": res.data.items
                                };
                            }
                        });

                        table.on('tool(saaspricingtactics-table)', function (saaspricingtacticsobj) {
                            var saaspricingtacticsdata = saaspricingtacticsobj.data;
                            if (saaspricingtacticsobj.event === 'del') {//删除
                                layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                                    admin.req({
                                        url: setter.apiAddress.saaspricingtactics.delete
                                        , data: { Id: saaspricingtacticsdata.id }
                                        , type: 'POST'
                                        , done: function (res) {
                                            layer.close(index);
                                            layer.msg(res.msg, { icon: 1 });
                                            table.reload('saaspricingtactics-table');
                                        }
                                    });
                                });
                            }
                        });

                        form.on('submit(saaspricingtactics-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.saaspricingtactics.add
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    $("#saaspricingtactics-add-form")[0].reset();
                                    layui.form.render();
                                    element.tabChange('saaspricingtactics-tab-filter', '0');
                                    table.reload('saaspricingtactics-table');
                                    layer.msg(res.msg, { icon: 1 });
                                }
                            });
                        });
                    });
                }
            });
        }
    });

    exports('saasversion', {})
});