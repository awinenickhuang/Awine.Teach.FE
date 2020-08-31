/**
 @Name：班级管理
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

    //加载排课资源 - 老师 - 教室
    var initScheduleResources = {
        initClassRooms: function (classRoomId) {
            common.ajax(setter.apiAddress.classroom.list, "GET", "", "", function (res) {
                $("#sel-class-room-list").empty();
                $("#sel-class-room-list").append("<option value=\"\">请选择上课教室</option>");
                $.each(res.data, function (index, item) {
                    if (item.id == classRoomId) {
                        $("#sel-class-room-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                    } else {
                        $("#sel-class-room-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                    }
                });
                form.render("select");
            });
        },
        initTeachers: function (teacherId) {
            common.ajax(setter.apiAddress.aspnetuser.list, "GET", "", { enableStatus: 1 }, function (res) {
                $("#sel-teacher-list").empty();
                $("#sel-teacher-list").append("<option value=\"\">请选择上课老师</option>");
                $.each(res.data, function (index, item) {
                    if (item.id == teacherId) {
                        $("#sel-teacher-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.userName + "</option>");
                    } else {
                        $("#sel-teacher-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                    }
                });
                form.render("select");
            });
        }
    };

    //初始化班级搜索条件 -> 搜索日历
    laydate.render({
        elem: '#input-laydate-select'
        , range: true
        , done: function (value, date, endDate) {
            if (!value) {
                $("#class-statr-time").val('');
                $("#class-end-time").val('');
            } else {
                $("#class-statr-time").val(date.year + "-" + date.month + "-" + date.date);
                $("#class-end-time").val(endDate.year + "-" + endDate.month + "-" + endDate.date);
            }
        }
    });

    //初始化班级搜索条件 -> 课程数据
    common.ajax(setter.apiAddress.course.list, "GET", "", "", function (res) {
        $("#sel-course-search").append("<option value=\"\">请选择课程</option>");
        $.each(res.data, function (index, item) {
            $("#sel-course-search").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
        });
        form.render("select");
    });

    //监听班级搜索事件
    form.on('submit(classes-search)', function (data) {
        var field = data.field;
        //执行重载
        table.reload('classes-table', {
            where: {
                name: $("#name").val(),
                courseId: $("#sel-course-search").val(),
                recruitStatus: 0,
                typeOfClass: $("#sel-typeofclass-search").val(),
                beginDate: $("#class-statr-time").val(),
                finishDate: $("#class-end-time").val(),
            },
            page: {
                curr: 1 //重新从第 1 页开始
            }
        });
    });

    //初始化班级列表数据
    table.render({
        elem: '#classes-table'
        , url: setter.apiAddress.classes.pagelist
        , toolbar: '#classes-toolbar'
        , cols: [[
            { type: 'checkbox' },
            { field: 'name', title: '班级名称' },
            { field: 'courseName', title: '所授课程' },
            { field: 'teacherName', title: '授课老师', align: 'center' },
            { field: 'classRoomName', align: 'center', title: '上课教室（默认）' },
            {
                field: 'classSize', title: '班级容量（人）', align: 'center', templet: function (d) {
                    return '<span style="color:#FF5722;">' + d.studentNumber + '</span>/' + d.classSize;
                }
            },
            {
                field: 'startDate', title: '开班日期', align: 'center', templet: function (d) {
                    return common.formatDate(d.startDate, "yyyy-MM-dd");
                }
            },
            {
                field: 'typeOfClass', title: '班级类型', align: 'center',
                templet: function (d) {
                    switch (d.typeOfClass) {
                        case 1:
                            return '<span style="color:#009688;">班课</span>';
                            break;
                        case 2:
                            return '<span style="color:#009688;">一对一</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            {
                field: 'recruitStatus', title: '招生状态', align: 'center',
                templet: function (d) {
                    switch (d.recruitStatus) {
                        case 1:
                            return '<span style="color:#009688;">开放招生</span>';
                            break;
                        case 2:
                            return '<span style="color:#FF5722;">暂停招生</span>';
                            break;
                        case 3:
                            return '<span style="color:#FFB800;">授课结束</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            }
        ]]
        , page: true
        , cellMinWidth: 80
        , text: {
            none: '暂无班级数据'
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

    //班级列表头工具栏事件
    table.on('toolbar(classes-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        var selected = checkStatus.data;
        switch (obj.event) {
            case 'add':
                admin.popupRight({
                    title: '添加'
                    , area: ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/classes/add').done(function () {
                            form.render();
                            laydate.render({
                                elem: '#startDateAdd',
                                calendar: true,
                                done: function (value, date, endDate) {
                                    //初始课程数据
                                    common.ajax(setter.apiAddress.course.list, "GET", "", "", function (res) {
                                        $("#sel-course-list").append("<option value=\"\">请选择</option>");
                                        $.each(res.data, function (index, item) {
                                            $("#sel-course-list").append("<option value=\"" + item.id + "\" data-teacher=\"" + item.teacherId + "\">" + item.name + "</option>");
                                        });
                                        form.render("select");
                                    });
                                }
                            });
                            //监听课程选择事件
                            form.on('select(sel-course-list-filter)', function (data) {
                                let teacherId = data.elem[data.elem.selectedIndex].dataset.teacher;
                                if (data.value === "") {
                                    $("#sel-teacher-list").empty();
                                    form.render("select");
                                    return;
                                }
                                //初始化老师 -> 默认跟随课程名师
                                common.ajax(setter.apiAddress.aspnetuser.list, "GET", "", {}, function (res) {
                                    $("#sel-teacher-list").empty();
                                    $("#sel-teacher-list").append("<option value=\"\">请选择</option>");
                                    $.each(res.data, function (index, item) {
                                        if (teacherId == item.id) {
                                            $("#sel-teacher-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.userName + "</option>");
                                        } else {
                                            $("#sel-teacher-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                        }
                                    });
                                    form.render("select");
                                });
                            });
                            //初始化教室
                            $("#sel-class-room-list").empty();
                            common.ajax(setter.apiAddress.classroom.list, "GET", "", {}, function (res) {
                                $("#sel-class-room-list").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-class-room-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            });
                            form.on('select(sel-teacher-list-filter)', function (data) {
                                $("#hiddenTeacherName").val(data.elem[data.elem.selectedIndex].text);
                            });
                            //监听提交
                            form.on('submit(classes-add-form-submit)', function (data) {
                                common.ajax(setter.apiAddress.classes.add, "POST", "", data.field, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        table.reload('classes-table');
                                    }
                                    layer.msg(res.message);
                                });
                            });
                        });
                    }
                });
                break;
            case 'edit':
                if (selected.length <= 0) {
                    layer.msg('请选择班级');
                    return;
                }
                if (selected.length > 1) {
                    layer.msg('只能选择一个班级');
                    return;
                }
                var data = selected[0];
                data.startDate = common.formatDate(data.startDate, "yyyy-MM-dd");
                admin.popupRight({
                    title: '修改'
                    , area: ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/classes/edit', data).done(function () {
                            form.render();
                            laydate.render({
                                elem: '#startDateEdit',
                            });
                            //初始课程数据
                            common.ajax(setter.apiAddress.course.list, "GET", "", "", function (res) {
                                $("#sel-course-edit").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.courseId == item.id) {
                                        $("#sel-course-edit").append("<option selected=\"selected\" data-teacher=\"" + item.teacherId + "\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-course-edit").append("<option data-teacher=\"" + item.teacherId + "\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            });
                            //初始化老师 -> 当前班级的老师
                            common.ajax(setter.apiAddress.aspnetuser.list, "GET", "", {}, function (res) {
                                $("#sel-teacher-edit").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.teacherId == item.id) {
                                        $("#sel-teacher-edit").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.userName + "</option>");
                                    } else {
                                        $("#sel-teacher-edit").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                    }
                                });
                                form.render("select");
                            });
                            //监听课程选择事件
                            form.on('select(sel-course-edit-filter)', function (data) {
                                let teacherId = data.elem[data.elem.selectedIndex].dataset.teacher;
                                if (data.value === "") {
                                    $("#sel-teacher-edit").empty();
                                    form.render("select");
                                    return;
                                }
                                //初始化老师 -> 课程选择时 - 默认跟随课程名师
                                common.ajax(setter.apiAddress.aspnetuser.list, "GET", "", {}, function (res) {
                                    $("#sel-teacher-edit").empty();
                                    $("#sel-teacher-edit").append("<option value=\"\">请选择</option>");
                                    $.each(res.data, function (index, item) {
                                        if (teacherId == item.id) {
                                            $("#sel-teacher-edit").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.userName + "</option>");
                                        } else {
                                            $("#sel-teacher-edit").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                        }
                                    });
                                    form.render("select");
                                });
                            });
                            //初始化教室
                            common.ajax(setter.apiAddress.classroom.list, "GET", "", {}, function (res) {
                                $("#sel-class-room-edit").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.classRoomId == item.id) {
                                        $("#sel-class-room-edit").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-class-room-edit").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            });
                            form.on('select(sel-teacher-edit-filter)', function (data) {
                                $("#hiddenEditTeacherName").val(data.elem[data.elem.selectedIndex].text);
                            });
                            $("#sel-recruitstatus-edit").val(data.recruitStatus);
                            $("#sel-typeofclass-edit").val(data.typeOfClass);
                            form.on('submit(classes-edit-form-submit)', function (data) {
                                common.ajax(setter.apiAddress.classes.update, "POST", "", data.field, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        table.reload('classes-table');
                                    }
                                    layer.msg(res.message);
                                });
                            });
                        });
                    }
                });
                break;
            case 'courseschedule'://排课
                if (selected.length <= 0) {
                    layer.msg('请选择班级');
                    return;
                }
                if (selected.length > 1) {
                    layer.msg('只能选择一个班级');
                    return;
                }
                var data = selected[0];
                //格式化为日历控件要求的日期格式
                data.startDate = common.formatDate(data.startDate, "yyyy-MM-dd");
                admin.popupRight({
                    title: '排课'
                    , area: ['45%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/classes/courseschedule', data).done(function () {
                            //定义需要的数据
                            var classStartDate = data.startDate;
                            var classRoomId = data.classRoomId;
                            var teacherId = data.teacherId;
                            var openingDate = '';
                            //初始化排课提交数据对象
                            var scheduleData = {
                                classId: data.id,
                                courseId: data.courseId,
                                teacherId: data.teacherId,
                                classRoomId: data.classRoomId,
                                repeatedWay: 1,
                                classOpeningDate: classStartDate,
                                daysBetween: 1,
                                exclusionRule: false,
                                weekDays: [],
                                classTime: {
                                    startHours: 0,
                                    startMinutes: 0,
                                    endHours: 0,
                                    endMinutes: 0
                                },
                                sescheduleEndWay: {//结束方式 1-按总课节数 2-按结束日期
                                    sescheduleEndWayNumber: 1,
                                    sescheduleEndWaySessionsNumber: 1,
                                    sescheduleEndWayClassEndDate: "",
                                }
                            };
                            form.render();
                            //1-初始化班级排课信息表格 -> 加载班级排课数据
                            table.render({
                                elem: '#courseschedule-table'
                                , url: setter.apiAddress.courseschedule.pagelist
                                , toolbar: '#courseschedule-table-toolbar'
                                , where: {
                                    classId: data.id,
                                }
                                , toolbar: '#courseschedule-table-toolbar'
                                , cols: [[
                                    { type: 'checkbox' },
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
                                        field: 'classStatus', title: '课节状态', align: 'center', width: 100,
                                        templet: function (d) {
                                            switch (d.classStatus) {
                                                case 1:
                                                    return '<span style="color:#009688;">待上课</span>';
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
                                    {
                                        field: 'createTime', title: '排课时间', align: 'center', templet: function (d) {
                                            return common.formatDate(d.createTime, "yyyy-MM-dd")
                                        }
                                    }
                                ]]
                                , page: true
                                , cellMinWidth: 80
                                , text: {
                                    none: '暂无排课数据'
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

                            //班级课表工具栏事件
                            table.on('toolbar(courseschedule-table)', function (obj) {
                                var checkStatus = table.checkStatus(obj.config.id);
                                var selected = checkStatus.data;
                                switch (obj.event) {
                                    case 'del':
                                        if (selected.length <= 0) {
                                            layer.msg('请选择课节');
                                            return;
                                        }
                                        if (selected.length > 1) {
                                            layer.msg('只能选择一个课节');
                                            return;
                                        }
                                        var data = selected[0];
                                        layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                                            common.ajax(setter.apiAddress.courseschedule.delete, "POST", "", { Id: data.id }, function (res) {
                                                if (res.statusCode == 200) {
                                                    table.reload('courseschedule-table');
                                                }
                                                layer.msg(res.message);
                                            });
                                        });
                                        break;

                                    case 'finish':
                                        if (selected.length <= 0) {
                                            layer.msg('请选择课节');
                                            return;
                                        }
                                        if (selected.length > 1) {
                                            layer.msg('只能选择一个课节');
                                            return;
                                        }
                                        var data = selected[0];
                                        layer.confirm('结课前需要先完成该课节学生点名，确定？', { icon: 3 }, function (index) {
                                            common.ajax(setter.apiAddress.courseschedule.updateschedulestatus, "POST", "", { Id: data.id, ClassStatus: 2 }, function (res) {
                                                if (res.statusCode == 200) {
                                                    table.reload('courseschedule-table');
                                                }
                                                layer.msg(res.message);
                                            });
                                        });
                                        break;
                                }
                            });

                            //排课信息与添加排课选项卡切换事件处理
                            element.on('tab(courseschedule-manage-tab-filter)', function (data) {
                                if (data.index == 1) {
                                    //初始化开课日期日历
                                    laydate.render({
                                        elem: '#classOpeningDate'
                                        , calendar: true
                                        , min: classStartDate
                                    });
                                    //初始化课节时间日历
                                    laydate.render({
                                        elem: '#class-time-select'
                                        , type: 'time'
                                        , format: 'H点m分'
                                        , calendar: true
                                        , range: '至'
                                        , done: function (value, date, endDate) {
                                            //课节上课时间
                                            scheduleData.classTime.startHours = date.hours;
                                            scheduleData.classTime.startMinutes = date.minutes;
                                            scheduleData.classTime.endHours = endDate.hours;
                                            scheduleData.classTime.endMinutes = endDate.minutes;
                                            //验证课节时间
                                            if (endDate.hours - date.hours <= 0 & endDate.minutes - date.minutes <= 0) {
                                                layer.msg("课节时间段不正确");
                                                $("#sel-teacher-list").empty();
                                                $("#sel-class-room-list").empty();
                                                form.render("select");
                                                return false;
                                            }
                                            //加载教室及教师信息并判断当前时段教室与教师是否冲突 
                                            openingDate = $("#classOpeningDate").val();
                                            initScheduleResources.initTeachers(teacherId);
                                            initScheduleResources.initClassRooms(classRoomId);
                                        }
                                    });
                                    //选择了授课老师再加载教室信息
                                    form.on('select(sel-teacher-list-filter)', function (data) {
                                        console.log(data);
                                    });
                                }
                            });

                            //排课方式切换事件处理
                            form.on('radio(radio-repeated-way-filter)', function (data) {
                                switch (data.value) {
                                    case "1":
                                        $("#repeated-way-onceaweek-container").show();
                                        $("#exclusion-rule-container").show();
                                        $("#seschedule-end-way-container").show();
                                        $("#days-between-container").hide();
                                        break;
                                    case "2":
                                        $("#repeated-way-onceaweek-container").hide();
                                        $("#days-between-container").hide();
                                        $("#seschedule-end-way-container").show();
                                        $("#exclusion-rule-container").show();
                                        break;
                                    case "3":
                                        $("#repeated-way-onceaweek-container").hide();
                                        $("#exclusion-rule-container").hide();
                                        $("#seschedule-end-way-container").hide();
                                        $("#days-between-container").hide();

                                        break;
                                    case "4":
                                        $("#repeated-way-onceaweek-container").hide();
                                        $("#days-between-container").show();
                                        $("#seschedule-end-way-container").show();
                                        $("#exclusion-rule-container").show();
                                        break;
                                }
                            });

                            //结束方式事件处理
                            form.on('select(seschedule-end-way-filter)', function (data) {
                                scheduleData.sescheduleEndWay.sescheduleEndWayNumber = data.value;

                                if (data.value == 1) {
                                    $("#seschedule-end-way-sessions-number-container").show();
                                    $("#seschedule-end-way-sessions-number-message").show();
                                    $("#seschedule-end-way-class-end-date-container").hide();
                                    $("#seschedule-end-way-class-end-date-message").hide();
                                    $("#sescheduleEndWaySessionsNumber").val(0);
                                } else {
                                    $("#seschedule-end-way-sessions-number-container").hide();
                                    $("#seschedule-end-way-sessions-number-message").hide();
                                    $("#seschedule-end-way-class-end-date-container").show();
                                    $("#seschedule-end-way-class-end-date-message").show();
                                    laydate.render({
                                        elem: '#sescheduleEndWayClassEndDate'
                                        , calendar: true
                                        , done: function (value, date, endDate) {
                                            scheduleData.sescheduleEndWay.sescheduleEndWayClassEndDate = value;
                                        }
                                    });
                                }
                            });

                            //是否排除法定假日
                            form.on('checkbox(chk-exclusionrule-filter)', function (data) {
                                scheduleData.exclusionRule = data.elem.checked;
                            });

                            //间隔天数
                            form.on('select(sel-days-between-list-filter)', function (data) {
                                scheduleData.daysBetween = data.value;
                            });

                            //监听添加排课数据提交
                            form.on('submit(courseschedule-add-form-submit)', function (data) {
                                scheduleData.classRoomId = $("#sel-class-room-list").val();
                                scheduleData.teacherId = $("#sel-teacher-list").val();
                                //排课方式
                                scheduleData.repeatedWay = $('input[name="RepeatedWay"]:checked').val();
                                //开课时间
                                scheduleData.classOpeningDate = $("#classOpeningDate").val();
                                //选中的每周天数
                                scheduleData.weekDays = [];
                                $("input:checkbox[name='classrules']:checked").each(function (i) {
                                    scheduleData.weekDays.push($(this).val());
                                });
                                if (scheduleData.repeatedWay == 1) {
                                    if (scheduleData.weekDays.length <= 0) {
                                        layer.msg("请选择排课规则");
                                        return;
                                    }
                                }

                                if (scheduleData.repeatedWay != 3) {
                                    //结束方式
                                    if (scheduleData.sescheduleEndWay.sescheduleEndWayNumber == 1) {
                                        scheduleData.sescheduleEndWay.sescheduleEndWaySessionsNumber = $("#sescheduleEndWaySessionsNumber").val();
                                        //验证排课结束的最大课节数
                                        var num = /^([1-9]\d?|366)$/;
                                        if (!num.test(scheduleData.sescheduleEndWay.sescheduleEndWaySessionsNumber)) {
                                            layer.msg("结束方式 - 总课节数只能输入1~366之间的数字");
                                            return;
                                        }
                                    }
                                    if (scheduleData.sescheduleEndWay.sescheduleEndWayNumber == 2) {
                                        //验证排课结束的日期
                                        if (scheduleData.sescheduleEndWay.sescheduleEndWayClassEndDate.length <= 0) {
                                            layer.msg("请选择排课结束日期");
                                            return;
                                        }
                                    }
                                }
                                //向后台提交排课数据
                                common.ajax(setter.apiAddress.courseschedule.addclassschedulingplan, "POST", "JSON", scheduleData, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                    }
                                    layer.msg(res.message);
                                });
                            });
                        });
                    }
                });
                break;
            case 'students':
                if (selected.length <= 0) {
                    layer.msg('请选择班级');
                    return;
                }
                if (selected.length > 1) {
                    layer.msg('只能选择一个班级');
                    return;
                }
                var data = selected[0];
                var classesId = data.id;
                admin.popupRight({
                    title: data.name + ' - 学生信息'
                    , area: ['50%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/classes/students', data).done(function () {
                            //初始化班级学生列表
                            table.render({
                                elem: '#class-students-table'
                                , url: setter.apiAddress.studentcourseitem.pagelist
                                , toolbar: '#classes-studens-toolbar'
                                , where: {
                                    classesId: data.id,
                                }
                                , cols: [[
                                    { type: 'checkbox' },
                                    { field: 'studentName', title: '学生姓名' },
                                    { field: 'courseName', title: '课消课程' },
                                    {
                                        field: 'purchaseQuantity', width: 100, title: '购买数量', align: 'center', templet: function (d) {
                                            switch (d.chargeManner) {
                                                case 1:
                                                    return '<span style="color:#01AAED;">' + d.purchaseQuantity + '课时</span>';
                                                    break;
                                                case 2:
                                                    return '<span style="color:#01AAED;">' + d.purchaseQuantity + '月</span>';
                                                    break;
                                                default: break;
                                            }
                                        }
                                    },
                                    {
                                        field: 'consumedQuantity', width: 100, title: '已消耗数量', align: 'center', templet: function (d) {
                                            switch (d.chargeManner) {
                                                case 1:
                                                    return '<span style="color:#01AAED;">' + d.consumedQuantity + '课时</span>';
                                                    break;
                                                case 2:
                                                    return '<span style="color:#01AAED;">' + d.consumedQuantity + '月</span>';
                                                    break;
                                                default: break;
                                            }
                                        }
                                    },
                                    {
                                        field: 'remainingNumber', width: 100, title: '剩余数量', align: 'center', templet: function (d) {
                                            switch (d.chargeManner) {
                                                case 1:
                                                    return '<span style="color:#01AAED;">' + d.remainingNumber + '课时</span>';
                                                    break;
                                                case 2:
                                                    return '<span style="color:#01AAED;">' + d.remainingNumber + '月</span>';
                                                    break;
                                                default: break;
                                            }
                                        }
                                    },
                                    {
                                        field: 'createTime', width: 130, title: '报名日期', align: 'center', templet: function (d) {
                                            return common.formatDate(d.createTime, "yyyy-MM-dd")
                                        }
                                    }
                                ]]
                                , page: true
                                , cellMinWidth: 80
                                , text: {
                                    none: '本班级暂无学生数据'
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
                            //监听Tab切换
                            element.on('tab(class-table-filter)', function (tabdata) {
                                switch (tabdata.index) {
                                    case 1://添加学生信息
                                        table.render({
                                            elem: '#students-tobe-assigned-table'
                                            , url: setter.apiAddress.studentcourseitem.pagelist
                                            , toolbar: '#students-tobe-assigned-table-toolbar'
                                            , where: {
                                                courseId: data.courseId,
                                                classesId: '00000000-0000-0000-0000-000000000000',
                                            }
                                            , cols: [[
                                                { type: 'checkbox' },
                                                { field: 'studentName', title: '学生姓名' },
                                                { field: 'courseName', title: '课消课程' },
                                                {
                                                    field: 'createTime', width: 130, title: '报名日期', align: 'center', templet: function (d) {
                                                        return common.formatDate(d.createTime, "yyyy-MM-dd")
                                                    }
                                                }
                                            ]]
                                            , page: true
                                            , cellMinWidth: 80
                                            , text: {
                                                none: '暂无学生数据'
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
                                        table.on('toolbar(students-tobe-assigned-table)', function (obj) {
                                            var checkStatus = table.checkStatus(obj.config.id);
                                            var selected = checkStatus.data;

                                            var submitData = {
                                                studentCourseItemAssignViewModel: []
                                            };

                                            $.each(selected, function (index, item) {
                                                submitData.studentCourseItemAssignViewModel.push({
                                                    id: item.id,
                                                    classesId: classesId
                                                });
                                            });

                                            switch (obj.event) {
                                                case 'add'://添加学生到班级
                                                    if (selected.length <= 0) {
                                                        layer.msg("请选择数据");
                                                        return;
                                                    }
                                                    common.ajax(setter.apiAddress.studentcourseitem.addstudentsintoclass, "POST", "", submitData, function (res) {
                                                        if (res.statusCode == 200) {
                                                            table.reload('students-tobe-assigned-table');
                                                            table.reload('class-students-table');
                                                        }
                                                        layer.msg(res.message);
                                                    });
                                                    break;
                                            }
                                        });
                                        break;
                                    default:

                                        break;
                                }
                            });
                            //班级学生列表工具栏事件
                            table.on('toolbar(class-students-table)', function (obj) {
                                var checkStatus = table.checkStatus(obj.config.id);
                                var selected = checkStatus.data;
                                switch (obj.event) {
                                    case 'remove'://移出本班

                                        if (selected.length <= 0) {
                                            layer.msg("请选择数据");
                                            return;
                                        }

                                        var submitData = {
                                            studentCourseItemAssignViewModel: []
                                        };

                                        $.each(selected, function (index, item) {
                                            submitData.studentCourseItemAssignViewModel.push({
                                                id: item.id,
                                                classesId: classesId
                                            });
                                        });

                                        layer.confirm('移除操作不会改变学生的考勤&账户&课时等信息，确定移除？', { icon: 3 }, function (index) {
                                            common.ajax(setter.apiAddress.studentcourseitem.removestudentfromclass, "POST", "", submitData, function (res) {
                                                if (res.statusCode == 200) {
                                                    table.reload('class-students-table');
                                                    table.reload('students-tobe-assigned-table');
                                                }
                                                layer.msg(res.message);
                                            });
                                        });
                                        break;
                                }
                            });

                        });
                    }
                });
                break;
            case 'del'://删除
                if (selected.length <= 0) {
                    layer.msg('请选择班级');
                    return;
                }
                if (selected.length > 1) {
                    layer.msg('只能选择一个班级');
                    return;
                }
                var data = selected[0];
                layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                    common.ajax(setter.apiAddress.classes.delete, "POST", "", { Id: data.id }, function (res) {
                        if (res.statusCode == 200) {
                            layer.close(index);
                            table.reload('classes-table');
                        }
                        layer.msg(res.message);
                    });
                });
                break;

            case 'classesend'://结课
                if (selected.length <= 0) {
                    layer.msg('请选择班级');
                    return;
                }
                if (selected.length > 1) {
                    layer.msg('只能选择一个班级');
                    return;
                }
                var data = selected[0];
                layer.confirm('该班级的所有课节都进行了结课操作，确定？', { icon: 3 }, function (index) {
                    common.ajax(setter.apiAddress.classes.updaterecruitstatus, "POST", "", { Id: data.id, RecruitStatus: 3 }, function (res) {
                        if (res.statusCode == 200) {
                            layer.close(index);
                            table.reload('classes-table');
                        }
                        layer.msg(res.message);
                    });
                });
                break;
        };
    });

    exports('classes', {})
});