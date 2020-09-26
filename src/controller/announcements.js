/**
 @Name：平台公告
 */
layui.define(['table', 'form', 'setter', 'verification', 'layedit'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , setter = layui.setter
        , form = layui.form
        , layedit = layui.layedit;

    table.render({
        elem: '#announcements-table'
        , url: setter.apiAddress.announcements.pagelist
        , toolbar: '#announcements-toolbar'
        , cols: [[
            { field: 'title', title: '标题' },
            { field: 'createTime', width: 200, align: 'center', title: '创建时间' },
            {
                width: 150,
                title: '操作',
                align: 'center',
                templet: function (d) {
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
    table.on('toolbar(announcements-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'add':
                admin.popup({
                    title: '添加'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['50%', '70%']
                    , resize: false
                    , success: function (layero, index) {
                        view(this.id).render('operation/announcements/add').done(function () {
                            form.render();
                            //监听消息类型切换事件
                            form.on('select(sel-announcementType-list-filter)', function (data) {
                                //$("#tenantId").val();
                            });
                            var lay_edit_index = layedit.build('layedit_content', {
                                //暴露layupload参数设置接口 --详细查看layupload参数说明
                                uploadImage: {
                                    url: ''    //上传接口url
                                    , type: 'post' //默认post
                                }
                                , devmode: true
                                //插入代码设置
                                , codeConfig: {
                                    hide: true,  //是否显示编码语言选择框
                                    default: 'javascript' //hide为true时的默认语言格式
                                }
                                , tool: [
                                    'html', 'code', 'strong', 'underline', 'del', 'addhr'
                                    , '|', 'fontFomatt', 'colorpicker', 'face'
                                    , '|', 'left', 'center', 'right'
                                    , '|', 'link', 'unlink'
                                    , '|', 'image'
                                ]
                                , height: 310, //设置编辑器高度
                            });
                            //1-进行重新渲染表单
                            form.render(null, 'component-form-element');  //component-form-element 是form表单和提交按钮中 lay-filter中的值
                            //2-进行验证 同步一下
                            form.verify({
                                announcements_content_verify: function (value) {
                                    layedit.sync(lay_edit_index);
                                }
                            });
                            //监听提交
                            form.on('submit(announcements-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.announcements.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('announcements-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    table.on('tool(announcements-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                admin.req({
                    url: setter.apiAddress.announcements.delete
                    , data: { Id: data.id }
                    , type: 'POST'
                    , done: function (res) {
                        layer.close(index);
                        table.reload('announcements-table');
                    }
                });
            });
        }
    });

    exports('announcements', {})
});