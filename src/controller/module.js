/**
 @Name：模块管理
 */
layui.define(['form', 'setter', 'treeGrid', 'xmSelect', 'verification', 'table', 'element'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , setter = layui.setter
        , treeGrid = layui.treeGrid
        , xmSelect = layui.xmSelect
        , table = layui.table
        , element = layui.element
        , form = layui.form;
    treeGrid.render({
        id: "module-tree-table"
        , elem: '#module-tree-table'
        , url: setter.apiAddress.awinemodule.list
        , headers: {
            Authorization: "Bearer " + layui.data(setter.tableName)[setter.request.tokenName]
        }
        , toolbar: '#module-table-toolbar'
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
        , cellMinWidth: 80
        , height: 'full-160'
        , cols: [[
            { field: 'name', title: '名称', sort: false }
            , { field: 'descText', title: '描述', sort: false }
            , { field: 'redirectUri', title: '地址', sort: false }
            , {
                field: 'isEnable', title: '状态', align: 'center', width: 100,
                templet: function (d) { return d.isEnable == 1 ? '<span style="color:#009688;">启用</span>' : '<span style="color:#FF5722;">禁用</span>'; }
            }
            , {
                field: 'moduleIcon', title: 'Icon', align: 'center', width: 100,
                templet: function (d) { return '<i class="layui-icon ' + d.moduleIcon + '"></i>'; }
            }
            , { field: 'displayOrder', title: '显示顺序', width: 100, sort: false, align: 'center' }
            , {
                width: 220, title: '操作', align: 'center'
                , templet: function (d) {
                    var htmlButton = new Array();
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="edit"><i class="layui-icon layui-icon-edit"></i>编辑</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del"><i class="layui-icon layui-icon-delete"></i>删除</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="buttons"><i class="layui-icon layui-icon-edit"></i>按钮</a>');
                    return htmlButton.join('');
                }
            }
        ]]
        , parseData: function (res) {
            return {
                "code": 0,
                "msg": res.message,
                "data": res.data
            };
        }
        , text: {
            none: '暂无模块数据'
        }
    });

    //监听模块表格事件
    treeGrid.on('tool(module-tree-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                admin.req({
                    url: setter.apiAddress.awinemodule.delete
                    , data: { id: data.id }
                    , type: 'POST'
                    , done: function (res) {
                        treeGrid.reload('module-tree-table');
                    }
                });
            });
        } else if (obj.event === "edit") {
            admin.popupRight({
                title: '编辑'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('foundational/module/edit', data).done(function () {
                        form.render();
                        var parentModuleTree = xmSelect.render({
                            el: '#xmselect-parent-module',
                            tips: '顶级系统模块',
                            empty: '呀, 没有数据呢',
                            model: { label: { type: 'text' } },
                            toolbar: { show: true },
                            radio: true,
                            clickClose: true,
                            tree: {
                                show: true,
                                strict: false,
                                expandedKeys: [-1],
                            },
                            height: 'auto',
                            prop: {
                                value: 'id',
                            },
                            data: [],
                            on: function (data) {
                                var selected = data.arr;
                                if (selected.length > 0) {
                                    $("#parentId").val(selected[0].id);
                                } else {
                                    $("#parentId").val('');
                                }
                            }
                        });
                        //加载模块树型数据
                        admin.req({
                            url: setter.apiAddress.awinemodule.treelist
                            , data: { moduleParentId: data.parentId }
                            , done: function (res) {
                                parentModuleTree.update({
                                    data: res.data,
                                    autoRow: true,
                                });
                            }
                        });
                        //提交
                        form.on('submit(modules-edit-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.awinemodule.update
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    treeGrid.reload('module-tree-table');
                                }
                            });
                        });
                    });
                }
            });
        } else if (obj.event === "buttons") {
            admin.popupRight({
                title: data.name + ' - 按钮配置'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['40%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('/foundational/module/buttons', data).done(function () {

                        element.on('tab(button-manage-tab)', function (data) {
                            if (data.index == 1) {
                                $('#name').val('');
                                $('#buttonIcon').val('');
                                $('#accessCode').val('');
                                $('#displayOrder').val(1);
                            }
                        });

                        //按钮分页列表
                        table.render({
                            elem: '#buttons-table'
                            , url: setter.apiAddress.awinebutton.pagelist + "?moduleId=" + data.id
                            , cols: [[
                                { field: 'name', title: '名称' },
                                { field: 'accessCode', title: '权限码' },
                                {
                                    field: 'buttonIcon', title: '图标', align: 'center', width: 100,
                                    templet: function (d) { return '<i class="layui-icon ' + d.buttonIcon + '"></i>'; }
                                },
                                { field: 'displayOrder', width: 100, align: 'center', title: '显示顺序' },
                                {
                                    width: 100, title: '操作', align: 'center'
                                    , templet: function (d) {
                                        var htmlButton = new Array();
                                        htmlButton.push('<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del"><i class="layui-icon layui-icon-delete"></i>删除</a>');
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

                        table.on('tool(buttons-table)', function (obj) {
                            var data = obj.data;
                            if (obj.event === 'del') {
                                layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                                    admin.req({
                                        url: setter.apiAddress.awinebutton.delete
                                        , data: { id: data.id }
                                        , type: 'POST'
                                        , done: function (res) {
                                            layer.close(index);
                                            table.reload('buttons-table');
                                        }
                                    });
                                });
                            }
                        });

                        //监听提交
                        form.on('submit(buttons-add-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.awinebutton.add
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    element.tabChange('button-manage-tab', '0');
                                    table.reload('buttons-table');
                                }
                            });
                        });
                    });
                }
            });
        }
    });

    //事件
    var active = {
        add: function () {
            admin.popupRight({
                title: '添加'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('foundational/module/add').done(function () {
                        var parentModuleTree = xmSelect.render({
                            el: '#xmselect-parent-module',
                            tips: '顶级系统模块',
                            empty: '呀, 没有数据呢',
                            model: { label: { type: 'text' } },
                            toolbar: { show: true },
                            radio: true,
                            clickClose: true,
                            tree: {
                                show: true,
                                strict: false,
                                expandedKeys: [-1],
                            },
                            height: 'auto',
                            prop: {
                                value: 'id',
                            },
                            data: [],
                            on: function (data) {
                                var selected = data.arr;
                                if (selected.length > 0) {
                                    $("#parentId").val(selected[0].id);
                                } else {
                                    $("#parentId").val('');
                                }
                            }
                        });
                        //加载模块树型数据
                        admin.req({
                            url: setter.apiAddress.awinemodule.treelist
                            , data: {}
                            , done: function (res) {
                                parentModuleTree.update({
                                    data: res.data,
                                    autoRow: true,
                                });
                            }
                        });
                        form.on('submit(modules-add-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.awinemodule.add
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    treeGrid.reload('module-tree-table');
                                }
                            });
                        });
                    });
                }
            });
        }
    };

    $('.layui-btn.btn-module-add').on('click', function () {
        var type = $(this).data('type');
        active[type] ? active[type].call(this) : '';
    });

    exports('module', {})
});