/**
 @Name：法定假日
 */
layui.define(['table', 'form', 'common', 'setter', 'element', 'verification', 'laydate'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , form = layui.form
        , laydate = layui.laydate
        , element = layui.element;

    table.render({
        elem: '#holiday-table'
        , url: setter.apiAddress.holiday.pagelist
        , toolbar: '#holiday-toolbar'
        , cols: [[
            { field: 'year', align: 'center', title: '年份标识' },
            { field: 'holidayName', align: 'center', title: '假日名称' },
            {
                field: 'holidayDate', width: 130, title: '假日日期', align: 'center', templet: function (d) {
                    return common.formatDate(d.holidayDate, "yyyy-MM-dd");
                }
            },
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
    table.on('toolbar(holiday-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'add':
                admin.popup({
                    title: '添加'
                    , area: ['30%', '35%']
                    , resize: false
                    , success: function (layero, index) {
                        view(this.id).render('operation/holiday/add').done(function () {
                            form.render();
                            laydate.render({
                                elem: '#holidayDate'
                                , calendar: true
                                , format: 'yyyy-MM-dd'
                                , done: function (value, date, endDate) {
                                    console.log(date.year);
                                    $("#year").val(date.year);
                                }
                            });
                            //监听提交
                            form.on('submit(holiday-form-submit)', function (data) {
                                common.ajax(setter.apiAddress.holiday.add, "POST", "", data.field, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        table.reload('holiday-table');
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

    table.on('tool(holiday-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                common.ajax(setter.apiAddress.holiday.delete, "POST", "", { Id: data.id }, function (res) {
                    if (res.statusCode == 200) {
                        layer.close(index);
                        table.reload('holiday-table');
                    }
                    layer.msg(res.message);
                });
            });
        } else if (obj.event === 'edit') {
            data.holidayDate = common.formatDate(data.holidayDate, "yyyy-MM-dd");
            admin.popup({
                title: '修改'
                , area: ['30%', '35%']
                , resize: false
                , success: function (layero, index) {
                    view(this.id).render('operation/holiday/edit', data).done(function () {
                        form.render();
                        laydate.render({
                            elem: '#holidayDate'
                            , calendar: true
                            , format: 'yyyy-MM-dd'
                            , done: function (value, date, endDate) {
                                console.log(date.year);
                                $("#year").val(date.year);
                            }
                        });
                        form.on('submit(holiday-edit-form-submit)', function (data) {
                            common.ajax(setter.apiAddress.holiday.update, "POST", "", data.field, function (res) {
                                if (res.statusCode == 200) {
                                    layer.close(index);
                                    table.reload('holiday-table');
                                }
                                layer.msg(res.message);
                            });
                        });
                    });
                }
            });
        }
    });

    exports('holiday', {})
});