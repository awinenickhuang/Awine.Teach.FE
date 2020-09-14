/**
 @Name：教师上课记录
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
        elem: '#teacherclassrecord-table'
        , url: setter.apiAddress.courseschedule.pagelist
        , toolbar: '#teacherclassrecord-toolbar'
        , where: { classStatus: 2 }
        , cols: [[
            { type: 'checkbox' },
            { field: 'courseName', title: '课程名称', align: 'left' },
            { field: 'className', title: '班级名称', align: 'left' },
            { field: 'teacherName', title: '上课教师', align: 'center', width: 130 },
            {
                field: 'courseDates', title: '上课日期', align: 'center', width: 130,
                templet: function (d) {
                    return '<span style="color:#FFB800;">' + common.formatDate(d.courseDates, "yyyy-MM-dd") + '</span>';
                }
            },
            {
                field: 'recordStatus', title: '课节时间', align: 'center', width: 130,
                templet: function (d) {
                    var time = [];
                    time.push('<span style="color:#009688;">');
                    time.push(common.formatZero(d.startHours, 2));
                    time.push(':');
                    time.push(common.formatZero(d.startMinutes, 2));
                    time.push(' - ');
                    time.push(common.formatZero(d.endHours, 2));
                    time.push(':');
                    time.push(common.formatZero(d.endMinutes, 2));
                    time.push('</span>');
                    return time.join('');
                }
            },
            { field: 'actualAttendanceNumber', width: 100, align: 'center', title: '出勤人数' },
            { field: 'actualleaveNumber', width: 100, align: 'center', title: '请假人数' },
            { field: 'actualAbsenceNumber', width: 100, align: 'center', title: '缺课人数' },
            { field: 'consumedQuantity', width: 100, align: 'center', title: '课消数量' },
            {
                field: 'consumedAmount', title: '课消金额', align: 'center', width: 130,
                templet: function (d) {
                    return '<span style="color:#FFB800;">' + common.fixedMoney(d.consumedAmount, "yyyy-MM-dd") + '</span>';
                }
            },
            {
                field: 'scheduleIdentification', title: '课节类型', align: 'center', width: 100,
                templet: function (d) {
                    switch (d.scheduleIdentification) {
                        case 1:
                            return '<span style="color:#009688;">正常课节</span>';
                            break;
                        case 2:
                            return '<span style="color:#FF5722;">试听课节</span>';
                            break;
                        case 3:
                            return '<span style="color:#FFB800;">补课课节</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            { field: 'createTime', width: 180, align: 'center', title: '创建时间' }
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
    table.on('toolbar(teacherclassrecord-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        var selected = checkStatus.data;
        switch (obj.event) {
            case 'search':
                admin.popupRight({
                    title: '搜索'
                    , area: ['35%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/teacherclassrecord/search').done(function () {
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
                            //初始化搜索条件 -> 课程数据
                            common.ajax(setter.apiAddress.course.list, "GET", "", "", function (res) {
                                $("#sel-course-search").append("<option value=\"\">请选择课程</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-course-search").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            });
                            form.on('select(course-search-filter)', function (data) {
                                //搜索 -> 班级数据
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
                            //初始化搜索条件 -> 教师数据
                            common.ajax(setter.apiAddress.aspnetuser.list, "GET", "", {}, function (res) {
                                $("#sel-teacher-search").empty();
                                $("#sel-teacher-search").append("<option value=\"\">请选择教师</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-teacher-search").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                });
                                form.render("select");
                            });
                            //搜索
                            form.on('submit(teacherclassrecord-search-submit)', function (data) {
                                var field = data.field;
                                let conditions = {
                                    courseId: field.CourseId,
                                    classId: field.ClassId,
                                    teacherId: field.TeacherId,
                                    scheduleIdentification: field.ScheduleIdentification,
                                    beginDate: field.StartTime,
                                    endDate: field.EndTime
                                };
                                layer.close(index);
                                //执行重载
                                table.reload('teacherclassrecord-table', {
                                    where: conditions,
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

    exports('teacherclassrecord', {})
});