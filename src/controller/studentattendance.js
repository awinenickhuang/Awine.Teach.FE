﻿/**
 @Name：上课记录
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

    form.render(null, 'studentattendance-search-form');

    //初始化搜索条件 -> 搜索日历
    laydate.render({
        elem: '#input-laydate-select'
        , range: true
        , done: function (value, date, endDate) {
            if (!value) {
                $("#statr-time").val('');
                $("#end-time").val('');
            } else {
                $("#statr-time").val(date.year + "-" + date.month + "-" + date.date);
                $("#end-time").val(endDate.year + "-" + endDate.month + "-" + endDate.date);
            }
        }
    });

    //初始化搜索条件 -> 初始课程数据
    common.ajax(setter.apiAddress.course.list, "GET", "", "", function (res) {
        $("#sel-course-search").append("<option value=\"\">请选择课程</option>");
        $.each(res.data, function (index, item) {
            $("#sel-course-search").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
        });
        form.render("select");
    });
    form.on('select(course-search-filter)', function (data) {
        console.log(data);
        //搜索 -> 初始班级数据
        $("#sel-class-search").empty();
        if (data.value == "") {
            form.render("select");
            return;
        }
        common.ajax(setter.apiAddress.classes.list, "GET", "", { courseId: data.value }, function (res) {
            $("#sel-class-search").append("<option value=\"\">请选择班级</option>");
            $.each(res.data, function (index, item) {
                $("#sel-class-search").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
            });
            form.render("select");
        });
    });

    //搜索
    form.on('submit(studentattendance-search)', function (data) {
        var field = data.field;
        let conditions = {
            studentName: $("#studentName").val(),
            courseId: $("#sel-course-search").val(),
            classId: $("#sel-class-search").val(),
            attendanceStatus: $("#sel-attendancestatus-search").val(),
            beginDate: $("#statr-time").val(),
            endDate: $("#end-time").val(),
        };
        let otherconditions = $("#sel-otherconditions-search").val();
        if (otherconditions == 1) {
            conditions.arrearage = 1;
        }
        if (otherconditions == 2) {
            conditions.expire = 1;
        }
        //执行重载
        table.reload('studentattendance-table', {
            where: conditions,
            page: {
                curr: 1 //重新从第 1 页开始
            }
        });
    });

    table.render({
        elem: '#studentattendance-table'
        , url: setter.apiAddress.studentattendance.pagelist
        , toolbar: '#studentattendance-toolbar'
        , cols: [[
            { type: 'checkbox' },
            { field: 'studentName', title: '学生' },
            { field: 'courseName', title: '课程' },
            { field: 'className', title: '班级' },
            {
                field: 'attendanceStatus', title: '出勤状态', align: 'center', width: 100,
                templet: function (d) {
                    switch (d.attendanceStatus) {
                        case 1:
                            return '<span style="color:#009688;">出勤</span>';
                            break;
                        case 2:
                            return '<span style="color:#FF5722;">缺勤</span>';
                            break;
                        case 3:
                            return '<span style="color:#FFB800;">请假</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            {
                field: 'recordStatus', title: '数据状态', align: 'center', width: 100,
                templet: function (d) {
                    switch (d.recordStatus) {
                        case 1:
                            return '<span style="color:#009688;">考勤正常</span>';
                            break;
                        case 2:
                            return '<span style="color:#FF5722;">考勤取消</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            { field: 'consumedQuantity', width: 100, align: 'center', title: '扣减课时' },
            { field: 'createTime', width: 200, align: 'center', title: '创建时间' }
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
    table.on('toolbar(studentattendance-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        var selected = checkStatus.data;
        switch (obj.event) {
            case 'cancel':
                if (selected.length <= 0) {
                    layer.msg('请选择上课记录');
                    return;
                }
                if (selected.length > 1) {
                    layer.msg('只能选择一条上课记录');
                    return;
                }
                var data = selected[0];
                layer.confirm('取消本次考勤，确定？', { icon: 3 }, function (index) {
                    common.ajax(setter.apiAddress.studentattendance.cancel, "POST", "", { studentAttendanceId: data.id }, function (res) {
                        if (res.statusCode == 200) {
                            layer.close(index);
                            table.reload('studentattendance-table');
                        }
                        layer.msg(res.message);
                    });
                });
                break;
        };
    });

    exports('studentattendance', {})
});