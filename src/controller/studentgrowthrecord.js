/**
 @Name：课后点评
 */
layui.define(['table', 'form', 'common', 'setter', 'element', 'verification'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , form = layui.form
        , element = layui.element;

    table.render({
        elem: '#growthrecord-table'
        , url: setter.apiAddress.studentgrowthrecord.pagelist
        , toolbar: '#growthrecord-toolbar'
        , cols: [[
            { field: 'studentName', width: 150, title: '学生' },
            { field: 'topics', title: '主题' },
            { field: 'viewCount', width: 100, align: 'center', title: '浏览次数' },
            { field: 'creatorName', width: 100, align: 'center', title: '创建人' },
            { field: 'createTime', width: 200, align: 'center', title: '创建时间' },
            {
                width: 200,
                title: '操作',
                align: 'center',
                templet: function (d) {
                    var htmlButton = new Array();
                    htmlButton.push('<div class="layui-btn-group">')
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="comment"><i class="layui-icon layui-icon-dialogue"></i>查看评论</a>');
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

    //表格按钮事件
    table.on('tool(growthrecord-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                admin.req({
                    url: setter.apiAddress.studentgrowthrecord.delete
                    , data: { Id: data.id }
                    , type: 'POST'
                    , done: function (res) {
                        layer.close(index);
                        table.reload('growthrecord-table');
                    }
                });
            });
        } else if (obj.event === 'comment') {
            admin.popupRight({
                title: '评论'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['60%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('mschool/growthrecord/comments', data).done(function () {
                        //form.render();
                        table.render({
                            elem: '#growthrecord-comment-table'
                            , url: setter.apiAddress.studentgrowthrecordcomment.pagelist
                            //, toolbar: '#growthrecord-comment-table'
                            , cols: [[
                                { field: 'creatorName', width: 150, title: '评论人' },
                                { field: 'contents', title: '评论内容' },
                                { field: 'createTime', width: 200, align: 'center', title: '创建时间' }
                            ]]
                            , page: true
                            , cellMinWidth: 80
                            , height: 'full-160'
                            , text: {
                                none: '暂无相关数据'
                            }
                            , where: {
                                studentGrowthRecordId: data.id
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
                    });
                }
            });
        }
    });

    //头工具栏事件
    table.on('toolbar(growthrecord-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'search':
                admin.popupRight({
                    title: '搜索'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('mschool/growthrecord/search').done(function () {
                            //初始化班级
                            admin.req({
                                url: setter.apiAddress.classes.list
                                , data: { isActive: true }
                                , done: function (res) {
                                    $("#sel-classes-list").append("<option value=\"\">请选择</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-classes-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //监听提交//搜索
                            form.on('submit(studentgrowthrecord-search-submit)', function (data) {
                                var field = data.field;
                                layer.close(index);
                                //执行重载
                                table.reload('growthrecord-table', {
                                    where: {
                                        studentId: field.studentId,
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
        };
    });

    exports('studentgrowthrecord', {})
});