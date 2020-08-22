/**
 @Name：试听管理
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
        elem: '#trialclass-table'
        , url: setter.apiAddress.trialclass.pagelist
        , toolbar: '#trialclass-toolbar'
        , cols: [[
            { type: 'checkbox' },
            { field: 'studentName', title: '姓名' },
            {
                field: 'gender', title: '性别', align: 'center',
                templet: function (d) {
                    switch (d.gender) {
                        case 1:
                            return '<span style="color:##009688;">男</span>';
                            break;
                        case 2:
                            return '<span style="color:#5FB878;">女</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            { field: 'phoneNumber', title: '手机号码', align: 'center' },
            { field: 'courseName', title: '试听课程' },
            { field: 'courseScheduleInformation', title: '课节信息' },
            { field: 'teacherName', title: '授课老师', align: 'center' },
            {
                field: 'listeningState', title: '试听状态', align: 'center',
                templet: function (d) {
                    switch (d.listeningState) {
                        case 1:
                            return '<span style="color:#009688;">已创建</span>';
                            break;
                        case 2:
                            return '<span style="color:#FFB800;">已到课</span>';
                            break;
                        case 3:
                            return '<span style="color:#FF5722;">已失效</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            {
                field: 'studentCategory', title: '学生标识', align: 'center',
                templet: function (d) {
                    switch (d.studentCategory) {
                        case 1:
                            return '<span style="color:#009688;">意向学生</span>';
                            break;
                        case 2:
                            return '<span style="color:#2F4056;">正式学生</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            {
                field: 'trialClassGenre', title: '试听类型', align: 'center',
                templet: function (d) {
                    switch (d.trialClassGenre) {
                        case 1:
                            return '<span style="color:#009688;">跟班试听</span>';
                            break;
                        case 2:
                            return '<span style="color:#2F4056;">一对一试听</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            { field: 'creatorName', title: '经办人', align: 'center' },
            {
                field: 'createTime', width: 200, title: '创建时间', align: 'center'
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
    table.on('toolbar(trialclass-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        var selected = checkStatus.data;
        switch (obj.event) {
            case 'delete':
                if (selected.length <= 0) {
                    layer.msg('请选择试听记录');
                    return;
                }
                if (selected.length > 1) {
                    layer.msg('只能选择一条试听记录');
                    return;
                }
                var data = selected[0];
                if (data.listeningState == 2) {
                    layer.msg('你选择的试听记录状态为[已到课]不允许再被删除');
                    return;
                }
                if (data.listeningState == 3) {
                    layer.msg('你选择的试听记录状态为[已失效]不允许再被删除');
                    return;
                }
                layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                    common.ajax(setter.apiAddress.trialclass.delete, "POST", "", { id: data.id }, function (res) {
                        if (res.statusCode == 200) {
                            table.reload('trialclass-table');
                        }
                        layer.msg(res.message);
                    });
                });
                break;
            case 'signinstatus':
                if (selected.length <= 0) {
                    layer.msg('请选择试听记录');
                    return;
                }
                if (selected.length > 1) {
                    layer.msg('只能选择一条试听记录');
                    return;
                }
                var data = selected[0];
                admin.popup({
                    title: '签到'
                    , area: ['30%', '25%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('marketing/trialclass/signinstatus', data).done(function () {
                            form.render();
                            form.on('submit(signin-add-form-submit)', function (data) {
                                common.ajax(setter.apiAddress.trialclass.updatelisteningstate, "POST", "", data.field, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        table.reload('trialclass-table');
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

    table.on('tool(trialclass-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'edit') {
            admin.popup({
                title: '修改'
                , area: ['50%', '35%']
                , resize: false
                , success: function (layero, index) {
                    view(this.id).render('marketing/trialclass/edit', data).done(function () {
                        form.render();
                        form.on('submit(trialclass-edit-form-submit)', function (data) {
                            common.ajax(setter.apiAddress.marketingchannel.update, "POST", "", data.field, function (res) {
                                if (res.statusCode == 200) {
                                    layer.close(index);
                                    table.reload('trialclass-table');
                                }
                                layer.msg(res.message);
                            });
                        });
                    });
                }
            });
        }
    });

    exports('trialclass', {})
});