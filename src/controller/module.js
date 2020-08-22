/**
 @Name：模块管理
 */
layui.define(['form', 'common', 'setter', 'treeGrid', 'treeSelect', 'verification', 'table', 'element'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , common = layui.common
        , setter = layui.setter
        , treeGrid = layui.treeGrid
        , treeSelect = layui.treeSelect
        , table = layui.table
        , element = layui.element
        , form = layui.form;

    treeGrid.set({ headers: { Authorization: "Bearer " + sessionStorage.access_token } });

    treeGrid.render({
        id: "module-tree-table"
        , elem: '#module-tree-table'
        , url: setter.apiAddress.awinemodule.list
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
                common.ajax(setter.apiAddress.awinemodule.delete, "POST", "", { id: data.id }, function (res) {
                    if (res.statusCode == 200) {
                        treeGrid.reload('module-tree-table');
                    }
                    layer.msg(res.message);
                });
            });
        } else if (obj.event === "edit") {
            admin.popupRight({
                title: '编辑'
                , area: ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('foundational/module/edit', data).done(function () {
                        form.render();
                        customTreeSelect.initTreeSelect("module-edit-select-tree", data.parentId);
                        form.on('submit(modules-edit-form-submit)', function (data) {
                            common.ajax(setter.apiAddress.awinemodule.update, "POST", "", $('#modules-edit-form').serialize(), function (res) {
                                if (res.statusCode == 200) {
                                    layer.close(index);
                                    treeGrid.reload('module-tree-table');
                                }
                                layer.msg(res.message);
                            });
                        });
                    });
                }
            });
        } else if (obj.event === "buttons") {

            admin.popupRight({
                title: data.name + ' - 按钮配置'
                , area: ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('/foundational/module/buttons', data).done(function () {
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
                                    common.ajax(setter.apiAddress.awinebutton.delete, "POST", "", { id: data.id }, function (res) {
                                        if (res.statusCode == 200) {
                                            table.reload('buttons-table');
                                        }
                                        layer.msg(res.message);
                                    });
                                });
                            }
                        });

                        //监听提交
                        form.on('submit(buttons-add-form-submit)', function (data) {
                            common.ajax(setter.apiAddress.awinebutton.add, "POST", "", data.field, function (res) {
                                if (res.statusCode == 200) {
                                    element.tabChange('button-manage-tab', '0');
                                    table.reload('buttons-table');
                                }
                                layer.msg(res.message);
                            });
                        });

                    });
                }
            });
        }
    });

    var customTreeSelect = {
        initTreeSelect: function (elementId, nodeId) {
            treeSelect.render({
                elem: "#" + elementId,
                url: setter.apiAddress.awinemodule.treelist,
                type: 'get',
                async: false,
                placeholder: '请选择所属模块',
                style: {
                    folder: {
                        enable: true
                    },
                    line: {
                        enable: true
                    }
                },
                search: true,
                click: function (data) {
                    $("#parentId").val(data.current.id);
                },
                success: function (data) {
                    treeObj = treeSelect.zTree(elementId);
                    var defaultNode = { id: "00000000-0000-0000-0000-000000000000", name: "一级模块" };
                    treeObj.addNodes(null, 0, defaultNode);
                    if (nodeId != "") {
                        var node = treeObj.getNodeByParam('id', nodeId);
                        treeObj.selectNode(node, true);
                        treeObj.checkNode(node, true, true);
                        $(".layui-treeSelect .layui-unselect").val(node.name);
                    }
                }
            });
        }
    }

    //事件
    var active = {
        add: function () {
            admin.popupRight({
                title: '添加'
                , area: ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('foundational/module/add').done(function () {
                        customTreeSelect.initTreeSelect("module-select-tree", "");
                        form.render(null, "modules-add-form");
                        form.on('submit(modules-add-form-submit)', function (data) {
                            common.ajax(setter.apiAddress.awinemodule.add, "POST", "", $("#modules-add-form").serialize(), function (res) {
                                if (res.statusCode == 200) {
                                    layer.close(index);
                                    treeGrid.reload('module-tree-table');
                                }
                                layer.msg(res.message);
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