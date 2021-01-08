/**
 @Name：补课管理
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
        elem: '#makeupmissedlessons-table'
        , url: setter.apiAddress.makeupmissedlesson.pagelist
        , toolbar: '#makeupmissedlessons-toolbar'
        , cols: [[
            { type: 'radio' },
            { field: 'name', title: '补课班级名称' },
            { field: 'courseName', align: 'center', title: '补课课程' },
            {
                field: 'courseDates', title: '上课日期', align: 'center', templet: function (d) {
                    return common.formatDate(d.courseDates, "yyyy-MM-dd")
                }
            },
            {
                field: 'startHours', title: '课节时间', align: 'center', width: 180,
                templet: function (d) {
                    return d.startHours + '点' + d.startMinutes + '分 至 ' + d.endHours + '点' + d.endMinutes + '分';
                }
            },
            { field: 'teacherName', align: 'center', title: '授课老师' },
            { field: 'classRoom', align: 'center', title: '上课教室' },
            {
                field: 'status', title: '补课班级状态', align: 'center', width: 150,
                templet: function (d) {
                    switch (d.status) {
                        case 1:
                            return '<span style="color:#009688;">已创建</span>';
                            break;
                        case 2:
                            return '<span style="color:#FF5722;">已结课</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            { field: 'createTime', width: 200, align: 'center', title: '创建时间' },
            {
                width: 220,
                title: '操作',
                align: 'center',
                templet: function (d) {
                    var htmlButton = new Array();
                    htmlButton.push('<div class="layui-btn-group">')
                    htmlButton.push('<a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="students"><i class="layui-icon layui-icon-user"></i>学生管理</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="edit"><i class="layui-icon layui-icon-edit"></i>编辑</a>');
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

    var mackupml = {
        // 设置最小可选的日期
        minDate: function () {
            var now = new Date();
            return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
        },
        initCourse: function () {
            admin.req({
                url: setter.apiAddress.course.list
                , data: {}
                , done: function (res) {
                    $("#sel-course-list").append("<option value=\"\">请选择课程</option>");
                    $.each(res.data, function (index, item) {
                        $("#sel-course-list").append("<option value=\"" + item.id + "\" data-teacher=\"" + item.teacherId + "\" data-teachername=\"" + item.teacherName + "\">" + item.name + "</option>");
                    });
                    form.render("select");
                }
            });
        },
        initTeacher: function (teacherId) {
            admin.req({
                url: setter.apiAddress.aspnetuser.list
                , data: { isActive: true }
                , done: function (res) {
                    $("#sel-teacher-list").append("<option value=\"\">请选择教师</option>");
                    $.each(res.data, function (index, item) {
                        if (teacherId == item.id) {
                            $("#sel-teacher-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.userName + "</option>");
                        } else {
                            $("#sel-teacher-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                        }
                    });
                    form.render("select");
                }
            });
        },
        initClassRoom: function () {
            admin.req({
                url: setter.apiAddress.classroom.list
                , data: {}
                , done: function (res) {
                    $("#sel-class-room-list").append("<option value=\"\">请选择教室</option>");
                    $.each(res.data, function (index, item) {
                        $("#sel-class-room-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                    });
                    form.render("select");
                }
            });
        }
    };
    //头工具栏事件
    table.on('toolbar(makeupmissedlessons-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'search':
                admin.popupRight({
                    title: '搜索'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/makeupmissedlessons/search').done(function () {
                            form.render();
                            //初始化搜索条件 -> 搜索日历
                            laydate.render({
                                elem: '#input-laydate-select'
                                , range: true
                                , done: function (value, date, endDate) {
                                    if (!value) {
                                        $("#beginDate").val('');
                                        $("#endDate").val('');
                                    } else {
                                        $("#beginDate").val(date.year + "-" + date.month + "-" + date.date + " 00:00:00");
                                        $("#endDate").val(endDate.year + "-" + endDate.month + "-" + endDate.date + " 23:59:59");
                                    }
                                }
                            });
                            admin.req({
                                url: setter.apiAddress.course.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-course-list").append("<option value=\"\">请选择课程</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-course-list").append("<option value=\"" + item.id + "\" data-teacher=\"" + item.teacherId + "\" data-teachername=\"" + item.teacherName + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            admin.req({
                                url: setter.apiAddress.aspnetuser.list
                                , data: { isActive: true }
                                , done: function (res) {
                                    $("#sel-teacher-list").append("<option value=\"\">请选择教师</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-teacher-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //监听提交//搜索
                            form.on('submit(makeupmissedlessons-search-submit)', function (data) {
                                var field = data.field;
                                layer.close(index);
                                //执行重载
                                table.reload('makeupmissedlessons-table', {
                                    where: {
                                        status: field.Status,
                                        courseId: field.CourseId,
                                        teacherId: field.TeacherId,
                                        beginDate: field.BeginDate,
                                        endDate: field.EndDate,
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
            case 'add':
                admin.popupRight({
                    title: '添加'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/makeupmissedlessons/add').done(function () {
                            form.render();
                            laydate.render({
                                elem: '#courseDates',
                                type: 'date',
                                format: 'yyyy-MM-dd',
                                min: mackupml.minDate()
                            });
                            laydate.render({
                                elem: '#classTimeRange'
                                , type: 'time'
                                , calendar: true
                                , range: '至'
                                , format: 'HH:mm'
                                , done: function (value, date, endDate) {
                                    //赋值课节时间段
                                    $("#startHours").val(date.hours);
                                    $("#startMinutes").val(date.minutes);
                                    $("#endHours").val(endDate.hours);
                                    $("#endMinutes").val(endDate.minutes);
                                    //验证课节时间段是否正确
                                    if (endDate.hours - date.hours <= 0 & endDate.minutes - date.minutes <= 0) {
                                        layer.msg("时间段不正确");
                                        form.render("select");
                                        return false;
                                    }
                                    //如果时间段正确则加载课程下拉列表
                                    mackupml.initCourse();
                                }
                            });
                            form.on('select(sel-course-list-filter)', function (data) {
                                let teacherId = data.elem[data.elem.selectedIndex].dataset.teacher;
                                $("#hiddenTeacherName").val(data.elem[data.elem.selectedIndex].dataset.teachername);
                                if (data.value === "") {
                                    $("#sel-teacher-list").empty();
                                    form.render("select");
                                    return;
                                }
                                mackupml.initTeacher(teacherId);
                                mackupml.initClassRoom();
                            });
                            form.on('select(sel-teacher-list-filter)', function (data) {
                                $("#hiddenTeacherName").val(data.elem[data.elem.selectedIndex].text);
                            });
                            //监听提交
                            form.on('submit(makeupmissedlessons-add-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.makeupmissedlesson.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('makeupmissedlessons-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    table.on('tool(makeupmissedlessons-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                admin.req({
                    url: setter.apiAddress.makeupmissedlesson.delete
                    , data: { Id: data.id }
                    , type: 'POST'
                    , done: function (res) {
                        layer.close(index);
                        table.reload('makeupmissedlessons-table');
                    }
                });
            });
        } else if (obj.event === 'edit') {
            if (data.status == 2) {
                layer.msg('补课已结课，不允许再修改了 ^_^', {
                    icon: 5
                });
                return;
            }
            admin.popupRight({
                title: '修改'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('teaching/makeupmissedlessons/edit', data).done(function () {
                        form.render();
                        laydate.render({
                            elem: '#courseDates',
                            type: 'date',
                            format: 'yyyy-MM-dd',
                            min: mackupml.minDate()
                        });
                        laydate.render({
                            elem: '#classTimeRange'
                            , type: 'time'
                            , calendar: true
                            , range: '至'
                            , format: 'HH:mm'
                            , done: function (value, date, endDate) {
                                //赋值课节时间段
                                $("#startHours").val(date.hours);
                                $("#startMinutes").val(date.minutes);
                                $("#endHours").val(endDate.hours);
                                $("#endMinutes").val(endDate.minutes);
                                //验证课节时间段是否正确
                                if (endDate.hours - date.hours <= 0 & endDate.minutes - date.minutes <= 0) {
                                    layer.msg("时间段不正确");
                                    form.render("select");
                                    return false;
                                }
                            }
                        });

                        let defaultdate = common.formatZero(data.startHours, 2) + ":" + common.formatZero(data.startMinutes, 2) + " 至 " + common.formatZero(data.endHours, 2) + ":" + common.formatZero(data.endMinutes, 2);
                        $("#classTimeRange").val(defaultdate);
                        $("#courseDates").val(common.formatDate(data.courseDates, 'yyyy-MM-dd'));

                        //课程
                        admin.req({
                            url: setter.apiAddress.course.list
                            , data: {}
                            , done: function (res) {
                                $("#sel-course-list").append("<option value=\"\">请选择课程</option>");
                                $.each(res.data, function (index, item) {
                                    if (item.id == data.courseId) {
                                        $("#sel-course-list").append("<option selected=\"selected\" value=\"" + item.id + "\" data-teacher=\"" + item.teacherId + "\" data-teachername=\"" + item.teacherName + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-course-list").append("<option value=\"" + item.id + "\" data-teacher=\"" + item.teacherId + "\" data-teachername=\"" + item.teacherName + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            }
                        });

                        //教师
                        $("#hiddenTeacherName").val(data.teacherName);
                        admin.req({
                            url: setter.apiAddress.aspnetuser.list
                            , data: { isActive: true }
                            , done: function (res) {
                                $("#sel-teacher-list").append("<option value=\"\">请选择教师</option>");
                                $.each(res.data, function (index, item) {
                                    if (item.id == data.teacherId) {
                                        $("#sel-teacher-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.userName + "</option>");
                                    } else {
                                        $("#sel-teacher-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                    }
                                });
                                form.render("select");
                            }
                        });

                        form.on('select(sel-teacher-list-filter)', function (data) {
                            $("#hiddenTeacherName").val(data.elem[data.elem.selectedIndex].text);
                        });

                        //教室
                        admin.req({
                            url: setter.apiAddress.classroom.list
                            , data: {}
                            , done: function (res) {
                                $("#sel-class-room-list").empty();
                                $("#sel-class-room-list").append("<option value=\"\">请选择上课教室</option>");
                                $.each(res.data, function (index, item) {
                                    if (item.id == data.classRoomId) {
                                        $("#sel-class-room-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-class-room-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            }
                        });
                        //提交
                        form.on('submit(makeupmissedlessons-edit-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.makeupmissedlesson.update
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    table.reload('makeupmissedlessons-table');
                                }
                            });
                        });
                    });
                }
            });
        } else if (obj.event === 'students') {
            admin.popupRight({
                title: '补课学生管理'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['50%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('teaching/makeupmissedlessons/students', data).done(function () {
                        form.render();
                        //班级中已有的学生
                        table.render({
                            elem: '#mk-students-table'
                            , url: setter.apiAddress.makeupmissedlesson.mkspagelist
                            , toolbar: '#mk-studens-toolbar'
                            , where: {
                                makeupMissedLessonId: data.id,
                            }
                            , cols: [[
                                { type: 'checkbox' },
                                {
                                    field: 'studentName', title: '学生姓名', align: 'center',
                                    templet: function (d) {
                                        return d.studentCourseItemViewModel.studentName;
                                    }
                                },
                                {
                                    field: 'courseName', title: '课消课程', align: 'center',
                                    templet: function (d) {
                                        return d.studentCourseItemViewModel.courseName;
                                    }
                                },
                                {
                                    field: 'classesName', title: '所在班级', align: 'center',
                                    templet: function (d) {
                                        return d.studentCourseItemViewModel.classesName;
                                    }
                                },
                                {
                                    field: 'purchaseQuantity', title: '购买量', align: 'center',
                                    templet: function (d) {
                                        switch (d.studentCourseItemViewModel.chargeManner) {
                                            case 1:
                                                return '<span style="color:#009688;">' + d.studentCourseItemViewModel.purchaseQuantity + '（课时）</span>';
                                                break;
                                            case 2:
                                                return '<span style="color:#FF5722;">' + d.studentCourseItemViewModel.purchaseQuantity + '（月）</span>';
                                                break;
                                            default:
                                                return '-';
                                                break;
                                        }
                                    }
                                },
                                {
                                    field: 'remainingNumber', title: '剩余量', align: 'center',
                                    templet: function (d) {
                                        switch (d.studentCourseItemViewModel.chargeManner) {
                                            case 1:
                                                return '<span style="color:#009688;">' + d.studentCourseItemViewModel.remainingNumber + '（课时）</span>';
                                                break;
                                            case 2:
                                                return '<span style="color:#FF5722;">' + d.studentCourseItemViewModel.remainingNumber + '（月）</span>';
                                                break;
                                            default:
                                                return '-';
                                                break;
                                        }
                                    }
                                },
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
                        //从补课班级中移除
                        table.on('toolbar(mk-students-table)', function (obj) {
                            var checkStatus = table.checkStatus(obj.config.id);
                            var selected = checkStatus.data;
                            console.log(selected);
                            var submitData = {
                                makeupMissedLessonId: data.id,
                                mksStudents: []
                            };

                            $.each(selected, function (index, item) {
                                submitData.mksStudents.push({
                                    id: item.id,
                                    attendanceId: item.attendanceId,
                                });
                            });

                            switch (obj.event) {
                                case 'remove':
                                    if (selected.length <= 0) {
                                        layer.msg("请选择数据");
                                        return;
                                    }
                                    admin.req({
                                        url: setter.apiAddress.makeupmissedlesson.removestudentfromclass
                                        , data: submitData
                                        , type: 'POST'
                                        , done: function (res) {
                                            element.tabChange('mk-table-filter', '0');
                                            table.reload('mk-students-table');
                                        }
                                    });
                                    break;
                            }
                        });
                        //监听Tab切换
                        element.on('tab(mk-table-filter)', function (tabdata) {
                            switch (tabdata.index) {
                                case 1://当前课程待补课学生列表
                                    table.render({
                                        elem: '#mk-students-tobe-assigned-table'
                                        , url: setter.apiAddress.studentattendance.pagelist
                                        , toolbar: '#mk-students-tobe-assigned-table-toolbar'
                                        , where: {
                                            courseId: data.courseId,
                                            scheduleIdentification: 1,
                                            processingStatus: 2
                                        }
                                        , cols: [[
                                            { type: 'checkbox' },
                                            { field: 'studentName', title: '学生姓名' },
                                            { field: 'courseName', title: '课程名称' },
                                            { field: 'className', title: '班级名称' },
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
                                                            return '<span style="color:#FF5722;">补课课节</span>';
                                                            break;
                                                        default:
                                                            return '-';
                                                            break;
                                                    }
                                                }
                                            },
                                            {
                                                field: 'attendanceStatus', title: '考勤状态', align: 'center', width: 100,
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
                                                field: 'recordStatus', title: '数据标识', align: 'center', width: 100,
                                                templet: function (d) {
                                                    switch (d.recordStatus) {
                                                        case 1:
                                                            return '<span style="color:#009688;">正常</span>';
                                                            break;
                                                        case 2:
                                                            return '<span style="color:#FF5722;">取消</span>';
                                                            break;
                                                        default:
                                                            return '-';
                                                            break;
                                                    }
                                                }
                                            },
                                            {
                                                field: 'processingStatus', title: '补课状态', align: 'center', width: 100,
                                                templet: function (d) {
                                                    switch (d.processingStatus) {
                                                        case 1:
                                                            return '<span style="color:#CC3399;">无需补课</span>';
                                                            break;
                                                        case 2:
                                                            return '<span style="color:#FF9933;">需要补课</span>';
                                                            break;
                                                        case 3:
                                                            return '<span style="color:#CC0066;">已安排补课</span>';
                                                            break;
                                                        case 4:
                                                            return '<span style="color:#336699;">已完成补课</span>';
                                                            break;
                                                        default:
                                                            return '-';
                                                            break;
                                                    }
                                                }
                                            },
                                            { field: 'createTime', width: 200, align: 'center', title: '考勤时间' }
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

                                    //添加进补课班级
                                    table.on('toolbar(mk-students-tobe-assigned-table)', function (obj) {
                                        var checkStatus = table.checkStatus(obj.config.id);
                                        var selected = checkStatus.data;

                                        var submitData = {
                                            makeupMissedLessonId: data.id,
                                            mksAttendances: []
                                        };

                                        $.each(selected, function (index, item) {
                                            submitData.mksAttendances.push({
                                                attendanceId: item.id,
                                            });
                                        });

                                        switch (obj.event) {
                                            case 'add':
                                                if (selected.length <= 0) {
                                                    layer.msg("请选择数据");
                                                    return;
                                                }
                                                admin.req({
                                                    url: setter.apiAddress.makeupmissedlesson.addstudenttoclass
                                                    , data: submitData
                                                    , type: 'POST'
                                                    , done: function (res) {
                                                        element.tabChange('mk-table-filter', '0');
                                                        table.reload('mk-students-table');
                                                    }
                                                });
                                                break;
                                        }
                                    });

                                    break;

                                default:

                                    break;
                            }
                        });
                    });
                }
            });
        }
    });

    exports('makeupmissedlessons', {})
});