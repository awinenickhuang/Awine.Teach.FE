/**
 @Name：课表管理
 */
layui.define(['table', 'form', 'common', 'setter', 'verification', 'fullCalendar', 'laydate'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , form = layui.form
        , laydate = layui.laydate
        , fullCalendar = layui.fullCalendar;
    var courseScheduleManagement = {
        //初始化搜索条件
        searchconditions: {
            courseId: '',
            classId: '',
            teacherId: '',
            classRoomId: ''
        },
        //初始化排课数据
        scheduleData: {
            classId: '',
            courseId: '',
            teacherId: '',
            teacherName: '',
            classRoomId: '',
            repeatedWay: 3,
            classOpeningDate: '',
            daysBetween: 0,
            exclusionRule: false,
            weekDays: [],
            classTime: {
                startHours: '',
                startMinutes: '',
                endHours: '',
                endMinutes: ''
            },
            //结束方式 1-按总课节数 2-按结束日期
            sescheduleEndWay: {
                sescheduleEndWayNumber: 1,//结束方式 -> 按总课节数
                sescheduleEndWaySessionsNumber: 1,//总课节数为一节课
                sescheduleEndWayClassEndDate: '',
            }
        },
        //初始化日期时间选择器
        initDateCtrl: function (openingdate) {
            laydate.render({
                elem: '#courseTime' //指定元素
                , type: 'time'
                , format: 'H点m分'
                , calendar: true
                , range: '至'
                , format: 'HH:mm'
                , done: function (value, date, endDate) {

                    courseScheduleManagement.scheduleData.classTime.startHours = date.hours;
                    courseScheduleManagement.scheduleData.classTime.startMinutes = date.minutes;
                    courseScheduleManagement.scheduleData.classTime.endHours = endDate.hours;
                    courseScheduleManagement.scheduleData.classTime.endMinutes = endDate.minutes;

                    if (endDate.hours - date.hours <= 0 & endDate.minutes - date.minutes <= 0) {
                        layer.msg('时间段不正确', { icon: 5 });
                        $("#calendar-classtime-add-form")[0].reset();
                        layui.form.render();
                        return false;
                    }

                    //课节时间选择后加载其他信息
                    courseScheduleManagement.initCourse();
                }
            });
        },
        /**
         * 1-过去的日期及时间不能再新增课节；
         * 2-招生状态为-开放招生-的班级才可以新增课节；
         * @param {any} info 当前点选的时间
         */
        add: function (info) {
            var currentDate = new Date();
            var selectedDate = new Date(info.dateStr);
            if (selectedDate.getTime() < currentDate.getTime()) {
                return;
            }
            admin.popupRight({
                title: '新增课节'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('teaching/classschedule/add').done(function () {
                        layer.closeAll('tips');
                        form.render();
                        courseScheduleManagement.initDateCtrl(info.dateStr);
                        courseScheduleManagement.scheduleData.classOpeningDate = info.dateStr;
                        //监听提交
                        form.on('submit(calendar-classtime-form-submit)', function (data) {
                            //向后台提交排课数据
                            admin.req({
                                url: setter.apiAddress.courseschedule.addclassschedulingplan
                                , data: courseScheduleManagement.scheduleData
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    courseScheduleManagement.initCalendar();
                                }
                            });
                        });
                    });
                }
            });
        },
        initCourse: function () {
            $("#sel-course-list").empty();
            admin.req({
                url: setter.apiAddress.course.list
                , data: { enabledStatus: 1 }
                , done: function (res) {
                    $("#sel-course-list").append("<option value=\"\">请选择课程</option>");
                    $.each(res.data, function (index, item) {
                        $("#sel-course-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                    });
                    form.render("select");
                }
            });
            //课程选择切换时加载班级信息
            form.on('select(sel-course-selectedfilter)', function (data) {
                courseScheduleManagement.scheduleData.courseId = data.value;
                $("#sel-classes-list").empty();
                if (data.value == "") {
                    $("#sel-classes-list").empty();
                    form.render("select");
                    return;
                }
                admin.req({
                    url: setter.apiAddress.classes.list
                    , data: { courseId: data.value, recruitStatus: 1 }
                    , done: function (res) {
                        $("#sel-classes-list").append("<option value=\"\">请选择班级</option>");
                        $.each(res.data, function (index, item) {
                            $("#sel-classes-list").append("<option data-classroomid=\"" + item.classRoomId + "\" data-teacherid=\"" + item.teacherId + "\" data-teachername=\"" + item.teacherName + "\" value=\"" + item.id + "\">" + item.name + "</option>");
                        });
                        form.render("select");
                    }
                });
            });
            //班级选择切换时加载老师及教室信息
            form.on('select(sel-classes-selectedfilter)', function (data) {
                courseScheduleManagement.scheduleData.classId = data.value;
                courseScheduleManagement.scheduleData.teacherId = data.elem[data.elem.selectedIndex].dataset.teacherid;
                courseScheduleManagement.scheduleData.teacherName = data.elem[data.elem.selectedIndex].dataset.teachername;
                courseScheduleManagement.scheduleData.classRoomId = data.elem[data.elem.selectedIndex].dataset.classroomid;
                //如果没有选班级则清空教师及教室信息
                if (data.value == "") {
                    $("#sel-teacher-list").empty();
                    $("#sel-class-room-list").empty();
                    form.render("select");
                    return;
                }
                courseScheduleManagement.initTeachers(data.elem[data.elem.selectedIndex].dataset.teacherid);
                courseScheduleManagement.initClassRooms(data.elem[data.elem.selectedIndex].dataset.classroomid);
            });
        },
        initClassRooms: function (classRoomId) {
            admin.req({
                url: setter.apiAddress.classroom.list
                , data: {}
                , done: function (res) {
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
                }
            });
            form.on('select(sel-class-room-selectedfilter)', function (data) {
                courseScheduleManagement.scheduleData.classRoomId = data.value;
            });
        },
        initTeachers: function (teacherId) {
            admin.req({
                url: setter.apiAddress.aspnetuser.list
                , data: { isActive: true }
                , done: function (res) {
                    $("#sel-teacher-list").empty();
                    $("#sel-teacher-list").append("<option value=\"\">请选择上课老师</option>");
                    $.each(res.data, function (index, item) {
                        if (item.id == teacherId) {
                            $("#sel-teacher-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.userName + "</option>");
                        } else {
                            $("#sel-teacher-list").append("<option data-teachername=\"" + item.userName + "\" value=\"" + item.id + "\">" + item.userName + "</option>");
                        }
                    });
                    form.render("select");
                }
            });
            form.on('select(sel-teacher-selectedfilter)', function (data) {
                courseScheduleManagement.scheduleData.teacherId = data.value;
                courseScheduleManagement.scheduleData.teacherName = data.elem[data.elem.selectedIndex].dataset.teachername;
            });
        },
        initCalendar: function () {
            var calendarDom = document.getElementById('schedule-overview-calendar');
            var calendar = new fullCalendar.Calendar(calendarDom, {
                headerToolbar: {
                    start: 'title',
                    center: 'dayGridMonth,timeGridWeek,timeGridDay',
                    end: 'today prev,next'
                },
                navLinks: true,            // can click day/week names to navigate views
                selectable: true,
                locale: 'zh-cn',
                height: 'auto',
                aspectRatio: 3,             //设置日历的宽高比，值为浮点型，默认1.35
                firstDay: 1,                //周一作为每周第一天
                allDayText: '全天',         //agenda视图下all-day的显示文本
                buttonText: {
                    prev: '←',
                    next: '→',
                    prevYear: '上一年',
                    nextYear: '下一年',
                    today: '返回今天',
                    month: '按月展示',
                    week: '按周展示',
                    day: '按日展示',
                    list: '列表展示'
                },
                dayHeaderFormat: {
                    weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true
                },
                nowIndicator: true,//Whether or not to display a marker indicating the current time.
                slotEventOverlap: true,//相同时间段的多个日程视觉上是否允许重叠，默认true允许
                //You may also specify options that apply to certain types of views:
                views: {
                    dayGrid: {
                        // options apply to dayGridMonth, dayGridWeek, and dayGridDay views
                    },
                    timeGrid: {
                        // options apply to timeGridWeek and timeGridDay views
                    },
                    week: {
                        // options apply to dayGridWeek and timeGridWeek views
                    },
                    day: {
                        // options apply to dayGridDay and timeGridDay views
                    }
                },
                loading: function (isLoading, view) { //视图数据加载中、加载完成触发
                    console.log("loading");
                    if (isLoading == true) {
                        console.log("view:" + view + ",开始加载");
                    } else if (isLoading == false) {
                        console.log("view:" + view + ",加载完成");
                    } else {
                        console.log("view:" + view + ",除非天塌下来否则不会进这个分支");
                    }
                },
                events: function (info, successCallback, failureCallback) {
                    //动态获取排课数据
                    var eventDataArry = [];
                    admin.req({
                        url: setter.apiAddress.courseschedule.list
                        , data: courseScheduleManagement.searchconditions
                        , done: function (res) {
                            if (res.code == 0) {
                                successCallback(res.data);
                            } else {
                                failureCallback(res.message);
                            }
                        }
                    });
                },
                eventClick: function (info) {
                    //edit
                },
                dateClick: function (info) {
                    //add
                    courseScheduleManagement.add(info);
                },
                eventMouseEnter: function (info) {
                    layer.closeAll('tips');
                    let str = new Array();
                    str.push('<div><i class="layui-icon layui-icon-time"></i> 授课时间：');
                    str.push(common.formatDate(info.event.extendedProps.courseDates, "yyyy-MM-dd") + ' ');
                    str.push(common.formatZero(info.event.extendedProps.startHours, 2));
                    str.push(':');
                    str.push(common.formatZero(info.event.extendedProps.startMinutes, 2));
                    str.push(' - ');
                    str.push(common.formatZero(info.event.extendedProps.endHours, 2));
                    str.push(':');
                    str.push(common.formatZero(info.event.extendedProps.endMinutes, 2));
                    str.push('</div>');
                    str.push('<div><i class="layui-icon layui-icon-read"></i> 授课课程：' + info.event.extendedProps.courseName + '<div>');
                    str.push('<div><i class="layui-icon layui-icon-heart"></i> 授课班级：' + info.event.title + '<div>');
                    str.push('<div><i class="layui-icon layui-icon-friends"></i> 授课老师：' + info.event.extendedProps.teacherName + '<div>');
                    str.push('<div><i class="layui-icon layui-icon-face-surprised"></i> 授课教室：' + info.event.extendedProps.classRoom + '<div>');
                    str.push('<div><i class="layui-icon layui-icon-star"></i> 课节状态：');
                    if (info.event.extendedProps.classStatus == 1) {
                        str.push('待上课');
                    } else {
                        str.push('<span style="color:#660033;">已结课</span>');
                    }
                    str.push('<div><i class="layui-icon layui-icon-menu-fill"></i> 课节类型：');
                    switch (info.event.extendedProps.scheduleIdentification) {
                        case 1:
                            str.push('<span style="color:#99CC66;">正常课节</span>');
                            break;
                        case 2:
                            str.push('<span style="color:#006699;">试听课节</span>');
                            break;
                        case 3:
                            str.push('<span style="color:#FF6600;">补课课节</span>');
                            break;
                        default:
                            str.push('<span style="color:#F0F0F0;">类型未知</span>');
                            break;
                    }
                    str.push('</div>');
                    str.push('<hr class="layui-bg-gray">');
                    str.push('<div class="layui-row layui-col-space10">');
                    str.push('<div class="layui-col-md3 content-center tootiptext">');
                    str.push('<a href="javascript:;" onclick="classtimeSignin(' + JSON.stringify(info.event.extendedProps).replace(/"/g, '&quot;') + ');">点名</a>');
                    str.push('</div>');
                    str.push('<div class="layui-col-md3 content-center tootiptext">');
                    str.push('<a href="javascript:;" onclick="classtimeEdit(' + JSON.stringify(info.event.extendedProps).replace(/"/g, '&quot;') + ');">调整课节</a>');
                    str.push('</div>');
                    str.push('<div class="layui-col-md3 content-center tootiptext">');
                    str.push('<a href="javascript:;" onclick="classtimeDetails(' + JSON.stringify(info.event.extendedProps).replace(/"/g, '&quot;') + ');">课节详情</a>');
                    str.push('</div>');
                    str.push('<div class="layui-col-md3 content-center tootiptext">');
                    str.push('<span layadmin-event="closetips"><a >关闭</a></span>');
                    str.push('</div>');
                    str.push('</div>');

                    layer.tips(str.join(''),
                        $(info.el),
                        {
                            tips: [2, '#009999'],
                            time: false,
                            tipsMore: false,
                            area: admin.screen() < 2 ? ['100%', 'auto'] : ['300px', 'auto'],
                            maxWidth: 500
                        });
                },
                eventMouseLeave: function (info) {
                    //layer.closeAll('tips');
                }
            });

            calendar.render();
        }
    }

    courseScheduleManagement.initCalendar();

    //课程 -> 搜索条件
    admin.req({
        url: setter.apiAddress.course.list
        , data: { enabledStatus: 1 }
        , done: function (res) {
            $("#sel-course-search").empty();
            $("#sel-course-search").append("<option value=\"\">请选择课程</option>");
            $.each(res.data, function (index, item) {
                $("#sel-course-search").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
            });
            form.render("select");
        }
    });

    //班级 -> 搜索条件
    form.on('select(course-search-filter)', function (data) {
        courseScheduleManagement.searchconditions.courseId = data.value;
        courseScheduleManagement.initCalendar();
        $("#sel-class-search").empty();
        if (data.value == "") {
            $("#sel-class-search").empty();
            form.render("select");
            courseScheduleManagement.searchconditions.courseId = '';
            courseScheduleManagement.searchconditions.classId = '';
            courseScheduleManagement.initCalendar();
            return;
        }
        admin.req({
            url: setter.apiAddress.classes.list
            , data: { courseId: data.value, recruitStatus: 1 }
            , done: function (res) {
                $("#sel-class-search").append("<option value=\"\">请选择班级</option>");
                $.each(res.data, function (index, item) {
                    $("#sel-class-search").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                });
                form.render("select");
            }
        });
    });

    form.on('select(class-search-filter)', function (data) {
        courseScheduleManagement.searchconditions.classId = data.value;
        courseScheduleManagement.initCalendar();
    });

    //教师 -> 搜索条件
    admin.req({
        url: setter.apiAddress.aspnetuser.list
        , data: {}
        , done: function (res) {
            $("#sel-teacher-search").empty();
            $("#sel-teacher-search").append("<option value=\"\">请选择老师</option>");
            $.each(res.data, function (index, item) {
                $("#sel-teacher-search").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
            });
            form.render("select");
        }
    });

    form.on('select(teacher-search-filter)', function (data) {
        courseScheduleManagement.searchconditions.teacherId = data.value;
        courseScheduleManagement.initCalendar();
    });

    //教室 -> 搜索条件
    admin.req({
        url: setter.apiAddress.classroom.list
        , data: {}
        , done: function (res) {
            $("#sel-class-room-search").empty();
            $("#sel-class-room-search").append("<option value=\"\">请选择教室</option>");
            $.each(res.data, function (index, item) {
                $("#sel-class-room-search").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
            });
            form.render("select");
        }
    });

    form.on('select(class-room-search-filter)', function (data) {
        courseScheduleManagement.searchconditions.classRoomId = data.value;
        courseScheduleManagement.initCalendar();
    });

    //点名
    window.classtimeSignin = function (data) {
        if (data.classStatus == 2) {
            layer.msg('课节已结课，不能再点名了哦。', { icon: 5 });
            return;
        }
        switch (data.scheduleIdentification) {
            case 1://正常课节点名（正式学生&试听学生）
                admin.popupRight({
                    title: '点名'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['50%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/classschedule/callsignin', data).done(function () {
                            layer.closeAll('tips');
                            //本节课上课学生总数
                            var studentCount = 0;
                            //初始化点名情况数据
                            $("#actualAttendanceStudents").html(0);
                            $("#actualAbsenceStudents").html(0);
                            $("#actualleaveStudents").html(0);
                            form.render();
                            //初始化试听学生
                            table.render({
                                elem: '#listen-student-table'
                                , url: setter.apiAddress.trialclass.list
                                , cols: [[
                                    { field: 'studentName', title: '姓名' },
                                    {
                                        field: 'gender', title: '性别', align: 'center',
                                        templet: function (d) {
                                            switch (d.gender) {
                                                case 1:
                                                    return '<span style="color:#1E9FFF;">男</span>';
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
                                    { field: 'courseName', title: '试听课程', align: 'center' },
                                    {
                                        field: 'listeningState', title: '试听状态', align: 'center',
                                        templet: function (d) {
                                            switch (d.listeningState) {
                                                case 1:
                                                    return '<span style="color:#009688;">已创建</span>';
                                                    break;
                                                case 2:
                                                    return '<span style="color:#FF5722;">已到课</span>';
                                                    break;
                                                case 3:
                                                    return '<span style="color:#FFB800;">已失效</span>';
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
                                    {
                                        field: 'id', title: '到课状态', width: 280, align: 'center',
                                        templet: function (d) {
                                            var buttonArr = [];
                                            buttonArr.push('<input id="btn_' + d.id + '" data-listenid="' + d.id + '" type="radio" name="listen-signin-' + d.id + '" value="2" title="到课" lay-filter="listen-signin-filter">&nbsp;&nbsp;');
                                            buttonArr.push('<input id="btn_' + d.id + '" data-listenid="' + d.id + '" type="radio" name="listen-signin-' + d.id + '" value="3" title="缺勤" lay-filter="listen-signin-filter">&nbsp;&nbsp;');
                                            return buttonArr.join('');
                                        }
                                    }
                                ]]
                                , page: false
                                , cellMinWidth: 80
                                , text: {
                                    none: '本课节无试听学生信息'
                                }
                                , where: {
                                    listeningState: 1,
                                    courseScheduleId: data.scheduleId
                                }
                                , response: {
                                    statusCode: 200
                                }
                                , parseData: function (res) {
                                    return {
                                        "code": res.statusCode,
                                        "msg": res.message,
                                        "count": res.data.length,
                                        "data": res.data
                                    };
                                }
                                , done: function (res) {
                                    studentCount += res.count;
                                }
                            });
                            //初始化正式学生
                            table.render({
                                elem: '#classtime-student-table'
                                , url: setter.apiAddress.studentcourseitem.list
                                , cols: [[
                                    { field: 'studentName', title: '姓名' },
                                    {
                                        field: 'gender', title: '性别', align: 'center',
                                        templet: function (d) {
                                            switch (d.gender) {
                                                case 1:
                                                    return '<span style="color:#1E9FFF;">男</span>';
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
                                    { field: 'courseName', title: '消课课程' },
                                    {
                                        field: 'purchaseQuantity', title: '购买数量', align: 'center', templet: function (d) {
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
                                        field: 'consumedQuantity', title: '已消耗数量', align: 'center', templet: function (d) {
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
                                        field: 'remainingNumber', title: '剩余数量', align: 'center', templet: function (d) {
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
                                        field: 'id', title: '到课状态', width: 280, align: 'center',
                                        templet: function (d) {
                                            var buttonArr = [];
                                            buttonArr.push('<input id="btn_' + d.id + '" data-studentid="' + d.studentId + '" data-studentname="' + d.studentName + '" data-studentcourseitemid="' + d.id + '" type="radio" name="classtime-signin-' + d.id + '" value="1" title="出勤" lay-filter="classtime-signin-filter">&nbsp;&nbsp;');
                                            buttonArr.push('<input id="btn_' + d.id + '" data-studentid="' + d.studentId + '" data-studentname="' + d.studentName + '" data-studentcourseitemid="' + d.id + '" type="radio" name="classtime-signin-' + d.id + '" value="2" title="缺勤" lay-filter="classtime-signin-filter">&nbsp;&nbsp;');
                                            buttonArr.push('<input id="btn_' + d.id + '" data-studentid="' + d.studentId + '" data-studentname="' + d.studentName + '" data-studentcourseitemid="' + d.id + '" type="radio" name="classtime-signin-' + d.id + '" value="3" title="请假" lay-filter="classtime-signin-filter">&nbsp;&nbsp;');
                                            return buttonArr.join('');
                                        }
                                    }
                                ]]
                                , page: false
                                , cellMinWidth: 80
                                , text: {
                                    none: '本课节无正式学生信息'
                                }
                                , where: { classesId: data.classId, learningProcess: 2 }
                                , response: {
                                    statusCode: 200
                                }
                                , parseData: function (res) {
                                    return {
                                        "code": res.statusCode,
                                        "msg": res.message,
                                        "count": res.data.length,
                                        "data": res.data
                                    };
                                }
                                , done: function (res) {
                                    studentCount += res.count;
                                }
                            });
                            var attendanceManage = {
                                attendanceData: {
                                    courseScheduleId: data.scheduleId,
                                    listenStudents: [],
                                    officialStudents: []
                                },
                                //移出所有记录
                                remove: function (obj, list) {
                                    list.forEach(element => {
                                        if (element.studentId == obj.studentId) {
                                            if (list.indexOf(element) > -1) {
                                                var i = list.indexOf(element);
                                                list.splice(i, 1);
                                            }
                                        }
                                    });
                                },
                                removelisten: function (obj, list) {
                                    list.forEach(element => {
                                        if (element.id == obj.id) {
                                            if (list.indexOf(element) > -1) {
                                                var i = list.indexOf(element);
                                                list.splice(i, 1);
                                            }
                                        }
                                    });
                                },
                                officialStatistics: function (state) {
                                    let count = 0;
                                    attendanceManage.attendanceData.officialStudents.forEach(element => {
                                        if (element.attendanceState == state) {
                                            count++;
                                        }
                                    });
                                    return count;
                                },
                                listeningStatistics: function (state) {
                                    let count = 0;
                                    attendanceManage.attendanceData.listenStudents.forEach(element => {
                                        if (element.listeningState == state) {
                                            count++;
                                        }
                                    });
                                    return count;
                                },
                                //统计出勤数据在前端显示
                                attendanceStatistics: function () {
                                    //出勤-1
                                    $("#actualAttendanceStudents").html((attendanceManage.officialStatistics(1) + attendanceManage.listeningStatistics(2)));
                                    //缺勤-2
                                    $("#actualAbsenceStudents").html((attendanceManage.officialStatistics(2) + attendanceManage.listeningStatistics(3)));
                                    //请假-3
                                    $("#actualleaveStudents").html(attendanceManage.officialStatistics(3));
                                }
                            };
                            //单选框 - 试听学生签到事件处理
                            form.on('radio(listen-signin-filter)', function (data) {
                                var listenStudent = {
                                    id: data.elem.dataset.listenid,
                                    listeningState: data.value
                                };
                                attendanceManage.removelisten(listenStudent, attendanceManage.attendanceData.listenStudents);
                                attendanceManage.attendanceData.listenStudents.push(listenStudent);
                                //统计出勤数据
                                attendanceManage.attendanceStatistics();
                            });
                            //单选框 - 正式学生签到事件处理
                            form.on('radio(classtime-signin-filter)', function (data) {
                                let officialStudent = {
                                    studentId: data.elem.dataset.studentid,
                                    gender: 1,
                                    studentName: data.elem.dataset.studentname,
                                    studentCourseItemId: data.elem.dataset.studentcourseitemid,
                                    attendanceState: data.value,
                                    consumedQuantity: 0
                                };

                                switch (data.elem.value) {
                                    case "1":
                                        //出勤
                                        officialStudent.consumedQuantity = 1;
                                        break;
                                    case "2":
                                        //缺课

                                        break;
                                    case "3":
                                        //请假

                                        break;
                                    default:
                                        officialStudent.consumedQuantity = 0;
                                        break;
                                }
                                attendanceManage.remove(officialStudent, attendanceManage.attendanceData.officialStudents);
                                attendanceManage.attendanceData.officialStudents.push(officialStudent);
                                //统计出勤数据
                                attendanceManage.attendanceStatistics();
                            });
                            //提交出勤数据
                            form.on('submit(complete-all-students-signin-form-submit)', function (data) {
                                let count = attendanceManage.officialStatistics(1) + attendanceManage.listeningStatistics(2) + attendanceManage.officialStatistics(2) + attendanceManage.listeningStatistics(3) + attendanceManage.officialStatistics(3);
                                if (count == 0) {
                                    layer.msg('该课节没有学生，请先添加学生！', { icon: 5 });
                                    return;
                                }
                                if (count != studentCount) {
                                    layer.msg('请检查所有学生考勤情况！', { icon: 5 });
                                    return;
                                }
                                layer.confirm('请确认考勤数据，确定？', { icon: 3 }, function (index) {
                                    admin.req({
                                        url: setter.apiAddress.studentattendance.attendance
                                        , data: attendanceManage.attendanceData
                                        , type: 'POST'
                                        , done: function (res) {
                                            layer.closeAll();
                                            courseScheduleManagement.initCalendar();
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
                break;
            case 2://试听试节点名（只有试听学生）
                admin.popupRight({
                    title: '点名'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['50%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/classschedule/trialclasssignin', data).done(function () {
                            layer.closeAll('tips');
                            form.render();
                            //本节课上课学生总数
                            var studentCount = 0;
                            //初始化点名情况数据
                            $("#actualAttendanceStudents").html(0);
                            $("#actualAbsenceStudents").html(0);

                            //初始化试听学生
                            table.render({
                                elem: '#listen-student-table'
                                , url: setter.apiAddress.trialclass.list
                                , cols: [[
                                    { field: 'studentName', title: '姓名' },
                                    {
                                        field: 'gender', title: '性别', align: 'center',
                                        templet: function (d) {
                                            switch (d.gender) {
                                                case 1:
                                                    return '<span style="color:#1E9FFF;">男</span>';
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
                                    { field: 'courseName', title: '试听课程', align: 'center' },
                                    {
                                        field: 'listeningState', title: '试听状态', align: 'center',
                                        templet: function (d) {
                                            switch (d.listeningState) {
                                                case 1:
                                                    return '<span style="color:#009688;">已创建</span>';
                                                    break;
                                                case 2:
                                                    return '<span style="color:#FF5722;">已到课</span>';
                                                    break;
                                                case 3:
                                                    return '<span style="color:#FFB800;">已失效</span>';
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
                                    {
                                        field: 'id', title: '到课状态', width: 280, align: 'center',
                                        templet: function (d) {
                                            var buttonArr = [];
                                            buttonArr.push('<input id="btn_' + d.id + '" data-listenid="' + d.id + '" type="radio" name="listen-signin-' + d.id + '" value="2" title="到课" lay-filter="listen-signin-filter">&nbsp;&nbsp;');
                                            buttonArr.push('<input id="btn_' + d.id + '" data-listenid="' + d.id + '" type="radio" name="listen-signin-' + d.id + '" value="3" title="缺勤" lay-filter="listen-signin-filter">&nbsp;&nbsp;');
                                            return buttonArr.join('');
                                        }
                                    }
                                ]]
                                , page: false
                                , cellMinWidth: 80
                                , text: {
                                    none: '本课节无试听学生信息'
                                }
                                , where: {
                                    listeningState: 1,
                                    courseScheduleId: data.scheduleId
                                }
                                , response: {
                                    statusCode: 200
                                }
                                , parseData: function (res) {
                                    return {
                                        "code": res.statusCode,
                                        "msg": res.message,
                                        "count": res.data.length,
                                        "data": res.data
                                    };
                                }
                                , done: function (res) {
                                    studentCount += res.count;
                                }
                            });

                            var attendanceManage = {
                                attendanceData: {
                                    courseScheduleId: data.scheduleId,
                                    listenStudents: [],
                                },
                                //移出所有记录
                                remove: function (obj, list) {
                                    list.forEach(element => {
                                        if (element.studentId == obj.studentId) {
                                            if (list.indexOf(element) > -1) {
                                                var i = list.indexOf(element);
                                                list.splice(i, 1);
                                            }
                                        }
                                    });
                                },
                                removelisten: function (obj, list) {
                                    list.forEach(element => {
                                        if (element.id == obj.id) {
                                            if (list.indexOf(element) > -1) {
                                                var i = list.indexOf(element);
                                                list.splice(i, 1);
                                            }
                                        }
                                    });
                                },
                                listeningStatistics: function (state) {
                                    let count = 0;
                                    attendanceManage.attendanceData.listenStudents.forEach(element => {
                                        if (element.listeningState == state) {
                                            count++;
                                        }
                                    });
                                    return count;
                                },
                                //统计出勤数据在前端显示
                                attendanceStatistics: function () {
                                    //到课-2
                                    $("#actualAttendanceStudents").html(attendanceManage.listeningStatistics(2));
                                    //缺勤-3
                                    $("#actualAbsenceStudents").html(attendanceManage.listeningStatistics(3));
                                }
                            };

                            //单选框 - 试听学生签到事件处理
                            form.on('radio(listen-signin-filter)', function (data) {
                                var listenStudent = {
                                    id: data.elem.dataset.listenid,
                                    listeningState: data.value
                                };
                                attendanceManage.removelisten(listenStudent, attendanceManage.attendanceData.listenStudents);
                                attendanceManage.attendanceData.listenStudents.push(listenStudent);

                                //统计出勤数据
                                attendanceManage.attendanceStatistics();
                            });

                            //提交出勤数据
                            form.on('submit(complete-all-students-signin-form-submit)', function (data) {
                                let count = attendanceManage.listeningStatistics(2) + attendanceManage.listeningStatistics(3);
                                if (count == 0) {
                                    layer.msg('请检查所有学生考勤情况！', { icon: 5 });
                                    return;
                                }
                                if (count != studentCount) {
                                    layer.msg('请检查所有学生考勤情况！', { icon: 5 });
                                    return;
                                }
                                layer.confirm('请确认考勤数据，确定？', { icon: 3 }, function (index) {
                                    admin.req({
                                        url: setter.apiAddress.studentattendance.trialclassattendance
                                        , data: attendanceManage.attendanceData
                                        , type: 'POST'
                                        , done: function (res) {
                                            layer.closeAll();
                                            courseScheduleManagement.initCalendar();
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
                break;
            case 3://补课课节点名（只有补课学生）
                admin.popupRight({
                    title: '点名'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['50%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/classschedule/mumlsignin', data).done(function () {
                            layer.closeAll('tips');
                            //本节课上课学生总数
                            var studentCount = 0;
                            //初始化点名情况数据
                            $("#actualAttendanceStudents").html(0);
                            $("#actualAbsenceStudents").html(0);
                            $("#actualleaveStudents").html(0);
                            table.render({
                                elem: '#makeupmissedlessons-student-table'
                                , url: setter.apiAddress.makeupmissedlesson.mkspagelist
                                , where: {
                                    classCourseScheduleId: data.scheduleId,
                                }
                                , cols: [[
                                    {
                                        field: 'studentName', title: '姓名', align: 'center',
                                        templet: function (d) {
                                            return d.studentCourseItemViewModel.studentName;
                                        }
                                    },
                                    {
                                        field: 'gender', title: '性别', align: 'center',
                                        templet: function (d) {
                                            switch (d.studentCourseItemViewModel.gender) {
                                                case 1:
                                                    return '<span style="color:#1E9FFF;">男</span>';
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
                                    {
                                        field: 'courseName', title: '消课课程', align: 'center',
                                        templet: function (d) {
                                            return d.studentCourseItemViewModel.courseName;
                                        }
                                    },
                                    {
                                        field: 'purchaseQuantity', title: '购买数量', align: 'center', templet: function (d) {
                                            switch (d.studentCourseItemViewModel.chargeManner) {
                                                case 1:
                                                    return '<span style="color:#01AAED;">' + d.studentCourseItemViewModel.purchaseQuantity + '课时</span>';
                                                    break;
                                                case 2:
                                                    return '<span style="color:#01AAED;">' + d.studentCourseItemViewModel.purchaseQuantity + '月</span>';
                                                    break;
                                                default: break;
                                            }
                                        }
                                    },
                                    {
                                        field: 'consumedQuantity', title: '已消耗数量', align: 'center', templet: function (d) {
                                            switch (d.studentCourseItemViewModel.chargeManner) {
                                                case 1:
                                                    return '<span style="color:#01AAED;">' + d.studentCourseItemViewModel.consumedQuantity + '课时</span>';
                                                    break;
                                                case 2:
                                                    return '<span style="color:#01AAED;">' + d.studentCourseItemViewModel.consumedQuantity + '月</span>';
                                                    break;
                                                default: break;
                                            }
                                        }
                                    },
                                    {
                                        field: 'remainingNumber', title: '剩余数量', align: 'center', templet: function (d) {
                                            switch (d.studentCourseItemViewModel.chargeManner) {
                                                case 1:
                                                    return '<span style="color:#01AAED;">' + d.studentCourseItemViewModel.remainingNumber + '课时</span>';
                                                    break;
                                                case 2:
                                                    return '<span style="color:#01AAED;">' + d.studentCourseItemViewModel.remainingNumber + '月</span>';
                                                    break;
                                                default: break;
                                            }
                                        }
                                    },
                                    {
                                        field: 'id', title: '到课状态', width: 280, align: 'center',
                                        templet: function (d) {
                                            var buttonArr = [];
                                            buttonArr.push('<input id="btn_' + d.id + '" data-studentid="' + d.studentId + '" data-studentname="' + d.studentCourseItemViewModel.studentName + '" data-studentcourseitemid="' + d.studentCourseItemViewModel.id + '" data-makeupmissedlessonid="' + d.makeupMissedLessonId + '" data-gender="' + d.studentCourseItemViewModel.gender + '" data-attendanceid="' + d.attendanceId + '" type="radio" name="classtime-signin-' + d.id + '" value="1" title="出勤" lay-filter="classtime-signin-filter">&nbsp;&nbsp;');
                                            buttonArr.push('<input id="btn_' + d.id + '" data-studentid="' + d.studentId + '" data-studentname="' + d.studentCourseItemViewModel.studentName + '" data-studentcourseitemid="' + d.studentCourseItemViewModel.id + '" data-makeupmissedlessonid="' + d.makeupMissedLessonId + '" data-gender="' + d.studentCourseItemViewModel.gender + '" data-attendanceid="' + d.attendanceId + '" type="radio" name="classtime-signin-' + d.id + '" value="2" title="缺勤" lay-filter="classtime-signin-filter">&nbsp;&nbsp;');
                                            buttonArr.push('<input id="btn_' + d.id + '" data-studentid="' + d.studentId + '" data-studentname="' + d.studentCourseItemViewModel.studentName + '" data-studentcourseitemid="' + d.studentCourseItemViewModel.id + '" data-makeupmissedlessonid="' + d.makeupMissedLessonId + '" data-gender="' + d.studentCourseItemViewModel.gender + '" data-attendanceid="' + d.attendanceId + '" type="radio" name="classtime-signin-' + d.id + '" value="3" title="请假" lay-filter="classtime-signin-filter">&nbsp;&nbsp;');
                                            return buttonArr.join('');
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
                                , done: function (res) {
                                    studentCount += res.count;
                                }
                            });

                            var attendanceManage = {
                                attendanceData: {
                                    courseScheduleId: data.scheduleId,
                                    makeupMissedLessonId: '',
                                    makeupMissedLessonStudents: []
                                },
                                //移出所有记录
                                remove: function (obj, list) {
                                    list.forEach(element => {
                                        if (element.studentId == obj.studentId) {
                                            if (list.indexOf(element) > -1) {
                                                var i = list.indexOf(element);
                                                list.splice(i, 1);
                                            }
                                        }
                                    });
                                },
                                officialStatistics: function (state) {
                                    let count = 0;
                                    attendanceManage.attendanceData.makeupMissedLessonStudents.forEach(element => {
                                        if (element.attendanceState == state) {
                                            count++;
                                        }
                                    });
                                    return count;
                                },
                                //统计出勤数据在前端显示
                                attendanceStatistics: function () {
                                    //出勤-1
                                    $("#actualAttendanceStudents").html(attendanceManage.officialStatistics(1));
                                    //缺勤-2
                                    $("#actualAbsenceStudents").html(attendanceManage.officialStatistics(2));
                                    //请假-3
                                    $("#actualleaveStudents").html(attendanceManage.officialStatistics(3));
                                }
                            };

                            //单选框 - 补课学生签到事件处理
                            form.on('radio(classtime-signin-filter)', function (data) {
                                attendanceManage.attendanceData.makeupMissedLessonId = data.elem.dataset.makeupmissedlessonid;
                                let officialStudent = {
                                    studentId: data.elem.dataset.studentid,
                                    gender: data.elem.dataset.gender,
                                    studentName: data.elem.dataset.studentname,
                                    studentCourseItemId: data.elem.dataset.studentcourseitemid,
                                    attendanceState: data.value,
                                    consumedQuantity: 0,
                                    attendanceId: data.elem.dataset.attendanceid
                                };

                                switch (data.elem.value) {
                                    case "1":
                                        //出勤
                                        officialStudent.consumedQuantity = 1;
                                        break;
                                    case "2":
                                        //缺课

                                        break;
                                    case "3":
                                        //请假

                                        break;
                                    default:
                                        officialStudent.consumedQuantity = 0;
                                        break;
                                }
                                attendanceManage.remove(officialStudent, attendanceManage.attendanceData.makeupMissedLessonStudents);
                                attendanceManage.attendanceData.makeupMissedLessonStudents.push(officialStudent);
                                //统计出勤数据
                                attendanceManage.attendanceStatistics();
                            });
                            //提交出勤数据
                            form.on('submit(complete-all-students-signin-form-submit)', function (data) {
                                let count = attendanceManage.officialStatistics(1) + attendanceManage.officialStatistics(2) + attendanceManage.officialStatistics(3);
                                if (studentCount == 0) {
                                    layer.msg('该课节没有学生，请先添加学生！', { icon: 5 });
                                    return;
                                }
                                if (count != studentCount) {
                                    layer.msg('请检查所有学生考勤情况！', { icon: 5 });
                                    return;
                                }
                                layer.confirm('请确认考勤数据，确定？', { icon: 3 }, function (index) {
                                    admin.req({
                                        url: setter.apiAddress.studentattendance.makeupmissedlessonattendance
                                        , data: attendanceManage.attendanceData
                                        , type: 'POST'
                                        , done: function (res) {
                                            layer.closeAll();
                                            courseScheduleManagement.initCalendar();
                                        }
                                    });
                                });
                            });

                        });
                    }
                });
                break;
            default:
                break;
        }

    }

    //课次调整
    window.classtimeEdit = function (data) {
        if (data.classStatus == 2) {
            layer.msg('课节已结课，不能再调整课节了哦。', { icon: 5 });
            return;
        }
        if (data.scheduleIdentification == 2) {
            layer.msg('一对一试听课节，不支持调整课节哦。', { icon: 5 });
            return;
        }
        if (data.scheduleIdentification == 3) {
            layer.msg('补课课节，请在补课管理中进行调整哦。', { icon: 5 });
            return;
        }
        admin.popupRight({
            title: '调整课节'
            , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
            , resize: false
            , closeBtn: 1
            , success: function (layero, index) {
                view(this.id).render('teaching/classschedule/edit', data).done(function () {
                    layer.closeAll('tips');
                    form.render();
                    $("#sel-schedule-identification-list").val(data.scheduleIdentification);
                    //初始化当前课节数据对象
                    var scheduleEditData = {
                        id: data.scheduleId,
                        classId: data.classId,
                        courseId: data.courseId,
                        teacherId: data.teacherId,
                        teacherName: data.teacherName,
                        classRoomId: data.classRoomId,
                        courseDates: data.courseDates,
                        startHours: $("#startHours").val(),
                        startMinutes: $("#startMinutes").val(),
                        endHours: $("#endHours").val(),
                        endMinutes: $("#endMinutes").val()
                    };

                    //TO DO:重写一次，避免影响，后期统一优化
                    let defaultdate = common.formatZero(data.startHours, 2) + ":" + common.formatZero(data.startMinutes, 2) + " 至 " + common.formatZero(data.endHours, 2) + ":" + common.formatZero(data.endMinutes, 2);

                    var editschedule = {
                        getclasses: function () {
                            admin.req({
                                url: setter.apiAddress.classes.list
                                , data: { courseId: data.courseId, recruitStatus: 1 }
                                , done: function (res) {
                                    $("#sel-classes-list").append("<option value=\"\">请选择班级</option>");
                                    $.each(res.data, function (index, item) {
                                        if (data.classId == item.id) {
                                            $("#sel-classes-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                        } else {
                                            $("#sel-classes-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                        }
                                    });
                                    form.render("select");
                                }
                            });
                        },
                        initClassRooms: function (classRoomId) {
                            admin.req({
                                url: setter.apiAddress.classroom.list
                                , data: {}
                                , done: function (res) {
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
                                }
                            });
                        },
                        initTeachers: function (teacherId) {
                            admin.req({
                                url: setter.apiAddress.aspnetuser.list
                                , data: { isActive: true }
                                , done: function (res) {
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
                                }
                            });
                        }
                    };

                    //选择教师时改变教师姓名
                    form.on('select(sel-teacher-list-filter)', function (data) {
                        scheduleEditData.teacherName = data.elem[data.elem.selectedIndex].text;
                    });

                    laydate.render({
                        elem: '#courseTime' //指定元素
                        , type: 'time'
                        , format: 'H点m分'
                        , calendar: true
                        , range: '至'
                        , format: 'HH:mm'
                        , done: function (value, date, endDate) {

                            $("#startHours").val(date.hours);
                            $("#startMinutes").val(date.minutes);
                            $("#endHours").val(endDate.hours);
                            $("#endMinutes").val(endDate.minutes);

                            if (endDate.hours - date.hours <= 0 & endDate.minutes - date.minutes <= 0) {
                                layer.msg('时间段不正确', { icon: 5 });
                                $("#calendar-classtime-add-form")[0].reset();
                                layui.form.render();
                                return false;
                            }

                            //加载教室及教师信息
                            editschedule.initTeachers(data.teacherId);
                            editschedule.initClassRooms(data.classRoomId);
                        }
                    });

                    $("#courseTime").val(defaultdate);

                    //课程处理
                    $("#sel-course-list").empty();
                    admin.req({
                        url: setter.apiAddress.course.list
                        , data: { enabledStatus: 1 }
                        , done: function (res) {
                            $("#sel-course-list").append("<option value=\"\">请选择课程</option>");
                            $.each(res.data, function (index, item) {
                                if (data.courseId == item.id) {
                                    $("#sel-course-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                } else {
                                    $("#sel-course-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                }
                            });
                            form.render("select");
                        }
                    });
                    //初始化&默认选中班级
                    editschedule.getclasses();
                    //初始化教师及教室信息，使用当前课节时间判断冲突状态
                    editschedule.initTeachers(data.teacherId, data.courseDates, data.StartHours, data.StartMinutes, data.EndHours, data.EndMinutes);
                    editschedule.initClassRooms(data.classRoomId, data.courseDates, data.StartHours, data.StartMinutes, data.EndHours, data.EndMinutes);
                    //课程下拉事件 -> 班级
                    form.on('select(sel-course-selectedfilter)', function (data) {
                        $("#sel-classes-list").empty();
                        if (data.value == "") {
                            $("#sel-classes-list").empty();
                            form.render("select");
                            return;
                        }
                        admin.req({
                            url: setter.apiAddress.classes.list
                            , data: { courseId: data.value, recruitStatus: 1 }
                            , done: function (res) {
                                $("#sel-classes-list").append("<option value=\"\">请选择班级</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-classes-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            }
                        });
                    });

                    form.on('submit(calendar-classtime-edit-form-submit)', function (data) {

                        scheduleEditData.classId = $("#sel-classes-list").val();
                        scheduleEditData.courseId = $("#sel-course-list").val();
                        scheduleEditData.teacherId = $("#sel-teacher-list").val();
                        scheduleEditData.classRoomId = $("#sel-class-room-list").val();
                        scheduleEditData.startHours = $("#startHours").val();
                        scheduleEditData.startMinutes = $("#startMinutes").val();
                        scheduleEditData.endHours = $("#endHours").val();
                        scheduleEditData.endMinutes = $("#endMinutes").val();

                        if ($("#endHours").val() - $("#startHours").val() <= 0 & $("#endMinutes").val() - $("#endHours").val() <= 0) {
                            layer.msg('时间段不正确', { icon: 5 });
                            $("#calendar-classtime-edit-form-submit")[0].reset();
                            layui.form.render();
                            return false;
                        }

                        //向后台提交排课数据
                        admin.req({
                            url: setter.apiAddress.courseschedule.update
                            , data: scheduleEditData
                            , type: 'POST'
                            , done: function (res) {
                                layer.close(index);
                                courseScheduleManagement.initCalendar();
                            }
                        });
                    });
                });
            }
        });
    }

    //课次详情
    window.classtimeDetails = function (data) {
        admin.popupRight({
            title: '课节详情'
            , area: admin.screen() < 2 ? ['100%', '100%'] : ['50%', '100%']
            , resize: false
            , closeBtn: 1
            , success: function (layero, index) {
                view(this.id).render('teaching/classschedule/details', data).done(function () {

                    layer.closeAll('tips');
                    form.render();

                    var initStudents = {
                        initClasstimeStudents: function () {
                            //init classtime students
                            table.render({
                                elem: '#classtime-student-table'
                                , url: setter.apiAddress.studentcourseitem.pagelist
                                , cols: [[
                                    { field: 'studentName', title: '姓名' },
                                    {
                                        field: 'id', title: '消课课程',
                                        templet: function (d) {
                                            return data.courseName;
                                        }
                                    },
                                    {
                                        field: 'purchaseQuantity', title: '购买数量', align: 'center', templet: function (d) {
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
                                        field: 'consumedQuantity', title: '已消耗数量', align: 'center', templet: function (d) {
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
                                        field: 'remainingNumber', title: '剩余数量', align: 'center', templet: function (d) {
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
                                ]]
                                , page: true
                                , cellMinWidth: 80
                                , text: {
                                    none: '本课节无试听正式学生信息'
                                }
                                , where: { classesId: data.classId, learningProcess: 2 }
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
                        },
                        initListenStudents: function () {
                            //init listen student table
                            table.render({
                                elem: '#listen-student-table'
                                , url: setter.apiAddress.trialclass.pagelist
                                , cols: [[
                                    { field: 'studentName', title: '姓名' },
                                    {
                                        field: 'gender', title: '性别', align: 'center',
                                        templet: function (d) {
                                            switch (d.gender) {
                                                case 1:
                                                    return '<span style="color:#1E9FFF;">男</span>';
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
                                    { field: 'courseName', title: '试听课程', align: 'center' },
                                    {
                                        field: 'listeningState', title: '试听状态', align: 'center',
                                        templet: function (d) {
                                            switch (d.listeningState) {
                                                case 1:
                                                    return '<span style="color:#009688;">已创建</span>';
                                                    break;
                                                case 2:
                                                    return '<span style="color:#FF5722;">已到课</span>';
                                                    break;
                                                case 3:
                                                    return '<span style="color:#FFB800;">已失效</span>';
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
                                    }
                                ]]
                                , page: true
                                , cellMinWidth: 80
                                , text: {
                                    none: '本课节无试听学生信息'
                                }
                                , where: {
                                    courseScheduleId: data.scheduleId
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
                        },
                        initMKStudents: function () {
                            table.render({
                                elem: '#makeupmissedlessons-student-table'
                                , url: setter.apiAddress.makeupmissedlesson.mkspagelist
                                , where: {
                                    classCourseScheduleId: data.scheduleId,
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
                        }
                    };
                    switch (data.scheduleIdentification) {
                        case 1:
                            $("#classtime-student-table-view").show();
                            $("#listen-student-table-view").show();
                            initStudents.initClasstimeStudents();
                            initStudents.initListenStudents();
                            break;
                        case 2://试听课节
                            $("#listen-student-table-view").show();
                            initStudents.initListenStudents();
                            break;
                        case 3://补课课节
                            $("#makeupmissedlessons-student-table-view").show();
                            initStudents.initMKStudents();
                            break;
                        default:
                            break;
                    }
                    form.on('submit(schedule-detail-form-submit)', function (data) {
                        layer.confirm('请确定删除该课节信息，确定？', { icon: 3 }, function (index) {
                            admin.req({
                                url: setter.apiAddress.courseschedule.delete
                                , data: { Id: $("#scheduleId").val() }
                                , type: 'POST'
                                , done: function (res) {
                                    layer.closeAll();
                                    courseScheduleManagement.initCalendar();
                                }
                            });
                        });
                    });
                });
            }
        });
    }

    exports('classschedule', {})
});