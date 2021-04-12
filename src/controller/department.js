/**
 @Name：部门管理
 */
layui.define(['tree', 'form', 'setter', 'verification', 'xmSelect'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , tree = layui.tree
        , setter = layui.setter
        , xmSelect = layui.xmSelect
        , form = layui.form;

    var departmentTools = {
        init: function () {
            admin.req({
                url: setter.apiAddress.department.tree
                , data: {}
                , type: 'GET'
                , done: function (res) {
                    //渲染
                    tree.render({
                        elem: '#department-tree'
                        , data: res.data
                        , onlyIconControl: true                           //是否仅允许节点左侧图标控制展开收缩
                        , customOperate: true                             //自定义属性
                        , edit: ['add', 'update', 'del']
                        , operate: function (obj) {
                            var type = obj.type;                          //得到操作类型：add、edit、del
                            var data = obj.data;                          //得到当前节点的数据
                            var elem = obj.elem;                          //得到当前节点元素

                            //Ajax 操作
                            var id = data.id;                             //得到节点索引

                            if (type === 'add') {                         //增加节点
                                admin.popupRight({
                                    title: '添加'
                                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                                    , resize: false
                                    , closeBtn: 1
                                    , success: function (layero, index) {
                                        view(this.id).render('foundational/department/add').done(function () {
                                            //加载树
                                            var departmentAddTree = xmSelect.render({
                                                el: '#xmselect-parent-organization',
                                                tips: '请选择',
                                                empty: '呀, 没有数据呢',
                                                model: { label: { type: 'text' } },
                                                toolbar: { show: true },
                                                radio: true,
                                                clickClose: true,
                                                tree: {
                                                    show: true,
                                                    strict: false,
                                                    expandedKeys: [-1, -3],
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

                                            $("#parentId").val(id);

                                            //加载部门树型数据
                                            admin.req({
                                                url: setter.apiAddress.department.xmselecttree
                                                , data: {
                                                    parentId: id
                                                }
                                                , done: function (res) {
                                                    departmentAddTree.update({
                                                        data: res.data,
                                                        autoRow: true,
                                                    });
                                                }
                                            });

                                            form.render(); //更新全部

                                            form.on('submit(department-add-form-submit)', function (data) {
                                                admin.req({
                                                    url: setter.apiAddress.department.add
                                                    , data: data.field
                                                    , type: 'POST'
                                                    , done: function (res) {
                                                        layer.close(index);
                                                        departmentTools.init();
                                                    }
                                                });
                                            });
                                        });
                                    }
                                });
                            } else if (type === 'update') { //修改节点
                                admin.req({
                                    url: setter.apiAddress.department.single
                                    , data: { id: data.id }
                                    , type: 'GET'
                                    , done: function (res) {
                                        admin.popupRight({
                                            title: '修改'
                                            , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                                            , resize: false
                                            , closeBtn: 1
                                            , success: function (layero, index) {
                                                view(this.id).render('foundational/department/edit', res.data).done(function () {
                                                    var departmentEditTree = xmSelect.render({
                                                        el: '#xmselect-parent-organization',
                                                        tips: '请选择',
                                                        empty: '呀, 没有数据呢',
                                                        model: { label: { type: 'text' } },
                                                        toolbar: { show: true },
                                                        radio: true,
                                                        clickClose: true,
                                                        tree: {
                                                            show: true,
                                                            strict: false,
                                                            expandedKeys: [-1, -3],
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

                                                    //加载部门树型数据
                                                    admin.req({
                                                        url: setter.apiAddress.department.xmselecttree
                                                        , data: { parentId: data.parentId }
                                                        , done: function (res) {
                                                            departmentEditTree.update({
                                                                data: res.data,
                                                                autoRow: true,
                                                            });
                                                        }
                                                    });

                                                    form.render(); //更新全部

                                                    //提交
                                                    form.on('submit(department-edit-form-submit)', function (data) {
                                                        admin.req({
                                                            url: setter.apiAddress.department.update
                                                            , data: data.field
                                                            , type: 'POST'
                                                            , done: function (res) {
                                                                layer.close(index);
                                                                departmentTools.init();
                                                            }
                                                        });
                                                    });
                                                });
                                            }
                                        });
                                    }
                                });
                            } else if (type === 'del') { //删除节点
                                let dellayer = layer.confirm('删除后不可恢复，确定？', {
                                    title: "提示",
                                    icon: 7,
                                    offset: '200px',
                                    btn: ['确定', '取消']
                                }, function () {
                                    admin.req({
                                        url: setter.apiAddress.department.delete
                                        , data: { Id: data.id }
                                        , type: 'POST'
                                        , done: function (res) {
                                            layer.close(dellayer);
                                            departmentTools.init();
                                        }
                                    });
                                })
                            }
                            return false;
                        }
                    });
                }
            });
        }
    };

    departmentTools.init();

    exports('department', {})
});