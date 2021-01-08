/**
 @Name：咨询记录
 */
layui.define(['table', 'form', 'setter', 'element', 'verification', 'rate', 'laydate', 'common'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , setter = layui.setter
        , form = layui.form
        , element = layui.element
        , laydate = layui.laydate
        , rate = layui.rate
        , common = layui.common;
    //初始化跟进记录数据
    table.render({
        elem: '#consultrecord-table'
        , url: setter.apiAddress.consultrecord.pagelist
        , toolbar: '#consultrecord-table-toolbar'
        , cols: [[
            { type: 'radio' },
            { field: 'name', title: '姓名', width: 100 },
            {
                field: 'gender', title: '性别', align: 'center', width: 100,
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
            { field: 'age', title: '年龄', width: 100, align: 'center' },
            { field: 'trackingStafferName', title: '跟进人', align: 'center', width: 100 },
            {
                field: 'trackingState', title: '跟进状态', align: 'center', width: 100,
                templet: function (d) {
                    switch (d.trackingState) {
                        case 1:
                            return '<span style="color:#FF5722;">待跟进</span>';
                            break;
                        case 2:
                            return '<span style="color:#01AAED;">跟进中</span>';
                            break;
                        case 3:
                            return '<span style="color:#5FB878;">已邀约</span>';
                            break;
                        case 4:
                            return '<span style="color:#FFB800;">已试听</span>';
                            break;
                        case 5:
                            return '<span style="color:#2F4056;">已到访</span>';
                            break;
                        case 6:
                            return '<span style="color:#009688;">已成交</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            { field: 'phoneNumber', title: '手机号码', width: 130 },
            { field: 'counselingCourseName', title: '咨询课程', width: 150 },
            { field: 'basicSituation', title: '基本情况' },
            { field: 'creatorName', title: '创建人', align: 'center', width: 100 },
            { field: 'marketingChannelName', title: '营销渠道', align: 'center', width: 100 },
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
    table.on('toolbar(consultrecord-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        var selected = checkStatus.data;
        switch (obj.event) {
            case 'search':
                admin.popupRight({
                    title: '搜索'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['35%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('marketing/consultrecord/search').done(function () {
                            form.render();
                            //日期范围
                            laydate.render({
                                elem: '#daterange'
                                , range: true
                                , done: function (value, date, endDate) {
                                    if (!value) {
                                        $("#consultrecord-statr-time").val('');
                                        $("#consultrecord-end-time").val('');
                                    } else {
                                        $("#consultrecord-statr-time").val(date.year + "-" + date.month + "-" + date.date);
                                        $("#consultrecord-end-time").val(endDate.year + "-" + endDate.month + "-" + endDate.date);
                                    }
                                }
                            });
                            //初始化首页课程数据
                            admin.req({
                                url: setter.apiAddress.course.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-counselingcourse-search-list").append("<option value=\"\">请选择课程</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-counselingcourse-search-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //初始化首页渠道数据
                            admin.req({
                                url: setter.apiAddress.marketingchannel.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-marketingchannel-search-list").append("<option value=\"\">请选择渠道</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-marketingchannel-search-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //初始化首页部门数据
                            $("#sel-department-search-list").append("<option value=\"\">请选择部门</option>");
                            admin.req({
                                url: setter.apiAddress.department.list
                                , data: {}
                                , done: function (res) {
                                    $.each(res.data, function (index, item) {
                                        $("#sel-department-search-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //部门选择时加载部门员工
                            form.on('select(sel-department-search-list-filter)', function (data) {
                                $("#sel-trackingstaffer-search-list").empty();
                                admin.req({
                                    url: setter.apiAddress.aspnetuser.allindepartment
                                    , data: { departmentId: data.value }
                                    , done: function (res) {
                                        $("#sel-trackingstaffer-search-list").append("<option value=\"\">请选择员工</option>");
                                        $.each(res.data, function (index, item) {
                                            $("#sel-trackingstaffer-search-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                        });
                                        form.render("select");
                                    }
                                });
                            });
                            //监听提交//搜索
                            form.on('submit(consultrecord-search-submit)', function (data) {
                                var field = data.field;
                                //执行重载
                                table.reload('consultrecord-table', {
                                    where: {
                                        name: field.StudentName,
                                        phoneNumber: field.PhoneNumber,
                                        startTime: field.StartTime,
                                        endTime: field.EndTime,
                                        counselingCourseId: field.CounselingcourseId,
                                        marketingChannelId: field.MarketingchannelId,
                                        trackingStafferId: field.TrackingStafferId,
                                        trackingState: field.TrackingState
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
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['35%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('marketing/consultrecord/add').done(function () {
                            $("#hiddenClinchIntentionAddStar").val(1);
                            rate.render({
                                elem: '#clinchIntention-add'
                                , value: 1
                                , text: false
                                , theme: '#FF8000'
                                , choose: function (value) {
                                    $("#hiddenClinchIntentionAddStar").val(value);
                                }
                            });
                            //初始渠道数据
                            admin.req({
                                url: setter.apiAddress.marketingchannel.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-marketingchannel-list").append("<option value=\"\">请选择渠道</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-marketingchannel-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //初始课程数据
                            admin.req({
                                url: setter.apiAddress.course.list
                                , data: { enabledStatus: 1 }
                                , done: function (res) {
                                    $("#sel-counselingcourse-list").append("<option value=\"\">请选择课程</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-counselingcourse-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //监听提交
                            form.on('submit(consultrecord-add-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.consultrecord.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('consultrecord-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
            case 'edit':
                if (selected.length <= 0) {
                    layer.msg('请选择咨询记录');
                    return;
                }
                var data = selected[0];
                admin.popupRight({
                    title: '修改'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('marketing/consultrecord/edit', data).done(function () {
                            $("#hiddenClinchIntentionEditStar").val(data.clinchIntentionStar);
                            rate.render({
                                elem: '#clinchIntention-edit'
                                , value: data.clinchIntentionStar
                                , text: false
                                , theme: '#FF8000'
                                , choose: function (value) {
                                    $("#hiddenClinchIntentionEditStar").val(value);
                                }
                            });
                            form.render();
                            //初始渠道数据
                            admin.req({
                                url: setter.apiAddress.marketingchannel.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-marketingchannel-list").append("<option value=\"\">请选择渠道</option>");
                                    $.each(res.data, function (index, item) {
                                        if (data.marketingChannelId == item.id) {
                                            $("#sel-marketingchannel-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                        } else {
                                            $("#sel-marketingchannel-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                        }
                                    });
                                    form.render("select");
                                }
                            });
                            //初始课程数据
                            admin.req({
                                url: setter.apiAddress.course.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-counselingcourse-list").append("<option value=\"\">请选择课程</option>");
                                    $.each(res.data, function (index, item) {
                                        if (data.counselingCourseId == item.id) {
                                            $("#sel-counselingcourse-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                        } else {
                                            $("#sel-counselingcourse-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                        }
                                    });
                                    form.render("select");
                                }
                            });
                            $('#sel-gender-edit').val(data.gender);
                            form.on('submit(consultrecord-edit-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.consultrecord.update
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('consultrecord-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
            case 'communicationrecord'://跟进记录
                if (selected.length <= 0) {
                    layer.msg('请选择咨询记录');
                    return;
                }
                var data = selected[0];
                if (data.trackingStafferId == "00000000-0000-0000-0000-000000000000") {
                    layer.msg('请先分配跟进人');
                    return;
                }
                admin.popupRight({
                    title: '跟进记录'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['60%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('marketing/consultrecord/communicationrecord', data).done(function () {

                            $("#sel-trackingstate-edit").find("option[value=" + data.trackingState + "]").prop("selected", true);
                            form.render();

                            $("#clinchIntentionStar").val(1);
                            rate.render({
                                elem: '#communication-record-clinchIntention-star'
                                , value: 1
                                , text: false
                                , theme: '#FF8000'
                                , choose: function (value) {
                                    $("#clinchIntentionStar").val(value);
                                }
                            });
                            table.render({
                                elem: '#communication-record-table'
                                , url: setter.apiAddress.communicationrecord.pagelist + "?consultRecordId=" + data.id
                                , cols: [[
                                    {
                                        field: 'clinchIntentionStar', title: '成交意向', width: 165, align: 'center',
                                        templet: function (d) {
                                            return '<div id="star' + d.id + '"></div>'
                                        }
                                    },
                                    { field: 'communicateWay', width: 100, align: 'center', title: '跟进方式' },
                                    { field: 'communicationContent', title: '跟进内容' },
                                    { field: 'trackingStafferName', width: 100, align: 'center', title: '跟进人' },
                                    { field: 'createTime', width: 200, align: 'center', title: '跟进时间' },
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
                                }, done: function (res, curr, count) {
                                    var data = res.data;
                                    for (var item in data) {
                                        rate.render({
                                            elem: '#star' + data[item].id + ''             //绑定元素
                                            , length: 5                                    //星星个数
                                            , value: data[item].clinchIntentionStar        //初始化值
                                            , theme: '#FF8000'                             //颜色
                                            , text: false                                  //显示文本，默认显示 '3.5星'
                                            , readonly: true                               //只读
                                        });
                                    }
                                }
                            });

                            //监听提交
                            form.on('submit(communication-record-add-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.communicationrecord.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        $("#communicationContent").val('');
                                        element.tabChange('communication-record-tab-filter', '0');
                                        table.reload('communication-record-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
            case 'trackingassigned'://分配跟进人
                if (selected.length <= 0) {
                    layer.msg('请选择咨询记录');
                    return;
                }
                var data = selected[0];
                admin.popupRight({
                    title: '跟进指派'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('marketing/consultrecord/trackingassigned', data).done(function () {
                            //初始化部门
                            admin.req({
                                url: setter.apiAddress.department.list
                                , data: { tenantId: data.tenantId }
                                , done: function (res) {
                                    $("#sel-department-list").append("<option value=\"\">请选择部门</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-department-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //监听部门下拉框事件
                            form.on('select(sel-department-list-filter)', function (data) {
                                $("#sel-staffer-list").empty();
                                $("#city-edit-name").val("");
                                //加载部门下的员工
                                admin.req({
                                    url: setter.apiAddress.aspnetuser.allindepartment
                                    , data: { departmentId: data.value }
                                    , done: function (res) {
                                        $("#sel-staffer-list").append("<option value=\"\">请选择</option>");
                                        $.each(res.data, function (index, item) {
                                            $("#sel-staffer-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                        });
                                        form.render("select");
                                    }
                                });
                            });
                            form.on('select(sel-staffer-list-filter)', function (data) {
                                $("#trackingStafferName").val(data.elem[data.elem.selectedIndex].text);
                            });
                            //监听提交
                            form.on('submit(trackingassigned-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.consultrecord.trackingassigned
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('consultrecord-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
            case 'listenhandling'://试听办理
                if (selected.length <= 0) {
                    layer.msg('请选择咨询记录');
                    return;
                }
                var data = selected[0];
                if (data.trackingStafferId == "00000000-0000-0000-0000-000000000000") {
                    layer.msg('请先分配跟进人');
                    return;
                }
                if (data.trackingState === 6) {
                    layer.msg('已成交学生请在 - 教务服务 - 学生管理 - 提交试听信息');
                    return;
                }
                admin.popupRight({
                    title: '试听办理'
                    , area: ['45%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('marketing/consultrecord/listenhandling', data).done(function () {
                            form.render();
                        });
                    }
                });
                break;
            case 'register'://报名办理
                if (selected.length <= 0) {
                    layer.msg('请选择咨询记录');
                    return;
                }
                if (selected.length > 1) {
                    layer.msg('只能选择一条咨询记录');
                    return;
                }
                var data = selected[0];
                if (data.trackingState === 6) {
                    layer.msg('已成交学生请在 - 教务服务 - 学生管理 - 提交报名信息');
                    return;
                }
                admin.popupRight({
                    title: '报名办理'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['40%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('marketing/consultrecord/register', data).done(function () {
                            laydate.render({
                                elem: '#classTime',
                                type: 'datetime',
                                format: 'yyyy-MM-dd HH:mm:ss',
                            });
                            form.render();
                            var studentregister = {
                                assistData: {
                                    chargemanner: 1,                                 //收费方式
                                    unitPrice: 0,                                    //课程单价
                                    totalPrice: 0,                                   //课程总价
                                },
                                registerData: {
                                    studentId: data.id,                              //学生标识
                                    name: data.name,                                 //学生姓名
                                    gender: data.gender,                             //学生性别
                                    age: data.age,                                   //学生年龄
                                    idNumber: data.idNumber,                         //身份证号
                                    phoneNumber: data.phoneNumber,                   //电话号码
                                    address: data.address,                           //联系地址
                                    courseId: '',                                    //报读课程
                                    receivableAmount: 0,                             //应收金额
                                    discountAmount: 0,                               //优惠金额
                                    realityAmount: 0,                                //实收金额
                                    paymentMethodId: '',                             //支付方式标识
                                    noteInformation: '',                             //缴费备注
                                    salesStaffId: data.trackingStafferId,            //业绩归属
                                    salesStaffName: data.trackingStafferName,        //业绩归属姓名
                                    marketingChannelId: data.marketingChannelId,     //营销渠道
                                    purchaseQuantity: 0,                             //购买数量
                                    chargeMannerId: ''                               //收费方式标识
                                },
                                //费用计算
                                computationalCosts: function () {
                                    //验证优惠金额
                                    if (!new RegExp("^-?[0-9]+([\.]{0,1}[0-9]{1,2})?$").test(studentregister.registerData.discountAmount)) {
                                        studentregister.registerData.discountAmount = 0;
                                    }
                                    //应收金额
                                    var receivableAmount = studentregister.registerData.purchaseQuantity * studentregister.assistData.unitPrice;
                                    //实收金额
                                    var realityAmount = receivableAmount - studentregister.registerData.discountAmount;
                                    if (realityAmount <= 0) {
                                        realityAmount = 0;
                                    }
                                    //应收金额
                                    $("#receivableAmount").val(common.fixedMoney(receivableAmount));
                                    //实收金额
                                    $("#realityAmount").val(common.fixedMoney(realityAmount));
                                    //应收金额
                                    studentregister.registerData.receivableAmount = receivableAmount;
                                    //实收金额
                                    studentregister.registerData.realityAmount = realityAmount;
                                },
                                clearInput: function () {
                                    $("#purchaseQuantity").val(0);
                                    $("#unitPrice").val(common.fixedMoney(0));
                                    $("#totalPrice").val(common.fixedMoney(0));
                                    $("#discountAmount").val(common.fixedMoney(0));
                                    $("#receivableAmount").val(common.fixedMoney(0));
                                    $("#realityAmount").val(common.fixedMoney(0));
                                }
                            };

                            //初始化业绩归属人
                            $("#sel-salesstaff-list").empty();
                            admin.req({
                                url: setter.apiAddress.aspnetuser.list
                                , data: { isActive: true }
                                , done: function (res) {
                                    $("#sel-salesstaff-list").append("<option value=\"\">请选择</option>");
                                    $.each(res.data, function (index, item) {
                                        if (item.id == data.trackingStafferId) {
                                            $("#sel-salesstaff-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.userName + "</option>");
                                        } else {
                                            $("#sel-salesstaff-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                        }
                                    });
                                    form.render("select");
                                }
                            });

                            //业绩归属人选择事件
                            form.on('select(sel-salesstaff-list-filter)', function (data) {
                                studentregister.registerData.salesStaffId = data.value;
                                studentregister.registerData.salesStaffName = data.elem[data.elem.selectedIndex].text;
                            });

                            //初始化支付方式
                            admin.req({
                                url: setter.apiAddress.paymentmethod.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-paymentmethod-list").append("<option value=\"\">请选择收款方式</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-paymentmethod-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });

                            //支付方式选择事件
                            form.on('select(sel-paymentmethod-list-filter)', function (data) {
                                studentregister.registerData.paymentMethodId = data.value;
                            });

                            //初始课程数据
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

                            //课程选择事件
                            form.on('select(sel-course-list-filter)', function (data) {

                                //清空所有输入
                                studentregister.clearInput();

                                //记录报名课程ID
                                studentregister.registerData.courseId = data.value;

                                //初始化报名课程的收费方式
                                admin.req({
                                    url: setter.apiAddress.coursechargemanner.list
                                    , data: { courseId: data.value }
                                    , done: function (res) {
                                        //初始化课程的收费方式下拉列表
                                        $("#sel-course-charges-type-list").empty();
                                        $("#sel-course-charges-type-list").append("<option value=\"\">请选择收费方式</option>");
                                        var options_classhour = [];
                                        var options_classmonth = [];
                                        options_classhour.push("<optgroup label=\"按课时收费\">");
                                        options_classmonth.push("<optgroup label=\"按月收费\">");
                                        $.each(res.data, function (index, item) {
                                            if (item.chargeManner == 1) {
                                                options_classhour.push("<option value=\"" + item.id + "\" data-chargemanner=\"" + item.chargeManner + "\" data-courseduration=\"" + item.courseDuration + "\" data-totalprice=\"" + item.totalPrice + "\" data-chargeunitprice=\"" + item.chargeUnitPriceClassHour + "\">" + item.courseDuration + "个课时 " + common.fixedMoney(item.totalPrice) + "（元） " + item.chargeUnitPriceClassHour + " 元/课时</option>");
                                            }
                                            if (item.chargeManner == 2) {
                                                options_classmonth.push("<option value=\"" + item.id + "\" data-chargemanner=\"" + item.chargeManner + "\" data-courseduration=\"" + item.courseDuration + "\" data-totalprice=\"" + item.totalPrice + "\" data-chargeunitprice=\"" + item.chargeUnitPriceMonth + "\">" + item.courseDuration + "个月 " + common.fixedMoney(item.totalPrice) + "（元） " + item.chargeUnitPriceMonth + " /月</option>");
                                            }
                                        });
                                        options_classhour.push("</optgroup>");
                                        options_classmonth.push("</optgroup>");
                                        if (options_classhour.length > 2) {
                                            $("#sel-course-charges-type-list").append(options_classhour.join(''));
                                        }
                                        if (options_classmonth.length > 2) {
                                            $("#sel-course-charges-type-list").append(options_classmonth.join(''));
                                        }
                                        form.render("select");
                                    }
                                });
                            });

                            //收费方式选择事件
                            form.on('select(sel-chargemanner-list-filter)', function (data) {

                                //记录收费方式ID
                                studentregister.registerData.chargeMannerId = data.value;

                                //收费方式
                                studentregister.assistData.chargemanner = data.elem[data.elem.selectedIndex].dataset.chargemanner;

                                //购买数量
                                $("#purchaseQuantity").val(data.elem[data.elem.selectedIndex].dataset.courseduration);
                                studentregister.registerData.purchaseQuantity = data.elem[data.elem.selectedIndex].dataset.courseduration;

                                //课程单价
                                $("#unitPrice").val(common.fixedMoney(data.elem[data.elem.selectedIndex].dataset.chargeunitprice));
                                studentregister.assistData.unitPrice = data.elem[data.elem.selectedIndex].dataset.chargeunitprice;

                                //优惠金额
                                $("#discountAmount").val(common.fixedMoney(0));
                                studentregister.registerData.discountAmount = 0;

                                //课程总价
                                $("#totalPrice").val(common.fixedMoney(data.elem[data.elem.selectedIndex].dataset.totalprice));
                                studentregister.assistData.totalPrice = data.elem[data.elem.selectedIndex].dataset.totalprice;

                                //计算支付信息
                                studentregister.computationalCosts();
                            });

                            //折扣金额变化重新计算金额
                            $('#discountAmount').bind('input onkeyup', function () {
                                var value = this.value;
                                studentregister.registerData.discountAmount = value;
                                studentregister.computationalCosts();
                            });

                            //折扣金额失去焦点时格式金额
                            $("#discountAmount").blur(function () {
                                var value = this.value;
                                var node = this;
                                node.value = common.fixedMoney(node.value);
                                studentregister.registerData.discountAmount = value;
                                studentregister.computationalCosts();
                            });

                            //监听提交
                            form.on('submit(register-form-submit)', function (datas) {
                                studentregister.registerData.noteInformation = $("#noteInformation").val();
                                admin.req({
                                    url: setter.apiAddress.student.registration
                                    , data: studentregister.registerData
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('consultrecord-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    exports('consultrecord', {})
});