/**
 @Name：咨询记录
 */
layui.define(['table', 'form', 'common', 'setter', 'element', 'verification', 'rate', 'laydate', 'fullCalendar'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , form = layui.form
        , element = layui.element
        , laydate = layui.laydate
        , rate = layui.rate
        , fullCalendar = layui.fullCalendar;

    form.render(null, 'consultrecord-search-filter');

    //搜索条件折叠效果
    element.render('collapse');

    // 设置最小可选的日期
    function minDate() {
        var now = new Date();
        return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
    }

    //日期范围
    laydate.render({
        elem: '#daterange'
        , range: true
    });

    //搜索
    form.on('submit(consultrecord-search)', function (data) {
        var field = data.field;
        //执行重载
        table.reload('consultrecord-table', {
            where: {
                name: $("#name").val(),
                phoneNumber: $("#phoneNumber").val(),
                startTime: "",
                endTime: "",
                counselingCourseId: $("#sel-counselingcourse-search-list").val(),
                marketingChannelId: $("#sel-marketingchannel-search-list").val(),
                trackingStafferId: $("#sel-trackingstaffer-search-list").val(),
                trackingState: $("#sel-trackingstate-list").val(),
            },
            page: {
                curr: 1 //重新从第 1 页开始
            }
        });
    });

    //初始化首页课程数据
    common.ajax(setter.apiAddress.course.list, "Get", "", {}, function (res) {
        $("#sel-counselingcourse-search-list").append("<option value=\"\">请选择课程</option>");
        $.each(res.data, function (index, item) {
            $("#sel-counselingcourse-search-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
        });
        form.render("select");
    });
    //初始化首页渠道数据
    common.ajax(setter.apiAddress.marketingchannel.list, "Get", "", {}, function (res) {
        $("#sel-marketingchannel-search-list").append("<option value=\"\">请选择渠道</option>");
        $.each(res.data, function (index, item) {
            $("#sel-marketingchannel-search-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
        });
        form.render("select");
    });
    //初始化首页部门数据
    $("#sel-department-search-list").append("<option value=\"\">请选择部门</option>");
    common.ajax(setter.apiAddress.department.list, "GET", "", {}, function (res) {
        $.each(res.data, function (index, item) {
            $("#sel-department-search-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
        });
        form.render("select");
    });
    //部门选择时加载部门员工
    form.on('select(sel-department-search-list-filter)', function (data) {
        $("#sel-trackingstaffer-search-list").empty();
        common.ajax(setter.apiAddress.aspnetuser.allindepartment, "GET", "", { departmentId: data.value }, function (res) {
            $("#sel-trackingstaffer-search-list").append("<option value=\"\">请选择员工</option>");
            $.each(res.data, function (index, item) {
                $("#sel-trackingstaffer-search-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
            });
            form.render("select");
        });
    });
    //跟进记录数据
    table.render({
        elem: '#consultrecord-table'
        , url: setter.apiAddress.consultrecord.pagelist
        , toolbar: '#consultrecord-table-toolbar'
        , cols: [[
            { type: 'checkbox' },
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
            case 'add':
                admin.popupRight({
                    title: '添加'
                    , area: ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('recruitmentservice/consultrecord/add').done(function () {
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
                            common.ajax(setter.apiAddress.marketingchannel.list, "GET", "", "", function (res) {
                                $("#sel-marketingchannel-list").append("<option value=\"\">请选择渠道</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-marketingchannel-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            });
                            //初始课程数据
                            common.ajax(setter.apiAddress.course.list, "GET", "", { enabledStatus: 1 }, function (res) {
                                $("#sel-counselingcourse-list").append("<option value=\"\">请选择课程</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-counselingcourse-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            });
                            //监听提交
                            form.on('submit(consultrecord-add-form-submit)', function (data) {
                                common.ajax(setter.apiAddress.consultrecord.add, "POST", "", data.field, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        table.reload('consultrecord-table');
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
                    layer.msg('请选择咨询记录');
                    return;
                }
                if (selected.length > 1) {
                    layer.msg('只能选择一条咨询记录');
                    return;
                }
                var data = selected[0];
                admin.popupRight({
                    title: '修改'
                    , area: ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('recruitmentservice/consultrecord/edit', data).done(function () {
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
                            common.ajax(setter.apiAddress.marketingchannel.list, "GET", "", "", function (res) {
                                $("#sel-marketingchannel-list").append("<option value=\"\">请选择渠道</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.marketingChannelId == item.id) {
                                        $("#sel-marketingchannel-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-marketingchannel-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            });
                            //初始课程数据
                            common.ajax(setter.apiAddress.course.list, "GET", "", "", function (res) {
                                $("#sel-counselingcourse-list").append("<option value=\"\">请选择课程</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.counselingCourseId == item.id) {
                                        $("#sel-counselingcourse-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-counselingcourse-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            });
                            $('#sel-gender-edit').val(data.gender);
                            form.on('submit(consultrecord-edit-form-submit)', function (data) {
                                common.ajax(setter.apiAddress.consultrecord.update, "POST", "", data.field, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        table.reload('consultrecord-table');
                                    }
                                    layer.msg(res.message);
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
                if (selected.length > 1) {
                    layer.msg('只能选择一条咨询记录');
                    return;
                }
                var data = selected[0];
                if (data.trackingStafferId == "00000000-0000-0000-0000-000000000000") {
                    layer.msg('请先分配跟进人');
                    return;
                }
                admin.popupRight({
                    title: '跟进记录'
                    , area: ['60%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('recruitmentservice/consultrecord/communicationrecord', data).done(function () {

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
                                common.ajax(setter.apiAddress.communicationrecord.add, "POST", "", data.field, function (res) {
                                    if (res.statusCode == 200) {
                                        $("#communicationContent").val('');
                                        element.tabChange('communication-record-tab-filter', '0');
                                        table.reload('communication-record-table');
                                    }
                                    layer.msg(res.message);
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
                if (selected.length > 1) {
                    layer.msg('只能选择一条咨询记录');
                    return;
                }
                var data = selected[0];
                admin.popupRight({
                    title: '跟进指派'
                    , area: ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('recruitmentservice/consultrecord/trackingassigned', data).done(function () {
                            //初始化部门
                            common.ajax(setter.apiAddress.department.list, "GET", "", { tenantId: data.tenantId }, function (res) {
                                $("#sel-department-list").append("<option value=\"\">请选择部门</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-department-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            });
                            //监听部门下拉框事件
                            form.on('select(sel-department-list-filter)', function (data) {
                                $("#sel-staffer-list").empty();
                                $("#city-edit-name").val("");
                                common.ajax(setter.apiAddress.aspnetuser.allindepartment, "GET", "", { departmentId: data.value }, function (res) {
                                    $("#sel-staffer-list").append("<option value=\"\">请选择</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-staffer-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                    });
                                    form.render("select");
                                });
                            });
                            //监听提交
                            form.on('submit(trackingassigned-form-submit)', function (data) {
                                common.ajax(setter.apiAddress.consultrecord.trackingassigned, "POST", "", data.field, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        table.reload('consultrecord-table');
                                    }
                                    layer.msg(res.message);
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
                if (selected.length > 1) {
                    layer.msg('只能选择一条咨询记录');
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
                        view(this.id).render('recruitmentservice/consultrecord/listenhandling', data).done(function () {
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
                    , area: ['40%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('recruitmentservice/consultrecord/register', data).done(function () {
                            laydate.render({
                                elem: '#classTime',
                                type: 'datetime',
                                format: 'yyyy-MM-dd HH:mm:ss',
                            });
                            form.render();
                            var studentregister = {
                                registerData: {
                                    studentId: data.id,
                                    name: data.name,
                                    gender: data.gender,
                                    age: data.age,
                                    idNumber: data.idNumber,
                                    phoneNumber: data.phoneNumber,
                                    address: data.address,
                                    courseId: '',
                                    receivableAmount: 0,//应收金额
                                    discountAmount: 0,//优惠金额
                                    realityAmount: 0,//实收金额
                                    paymentMethodId: '',//支付方式标识
                                    noteInformation: '',
                                    salesStaffId: data.trackingStafferId,
                                    marketingChannelId: data.marketingChannelId,
                                    purchaseQuantity: 0,//购买数量
                                    chargeMannerId: ''//收费方式标识
                                },
                                //费用计算
                                getReceivableAmount: function () {
                                    //课时数量或月数
                                    var courseDuration = 1;
                                    //单价
                                    var chargeUnitPrice = 0;
                                    //如果收费方式为：按课程收费
                                    if ($("#hid-charges-hargemanner").val() == 1) {
                                        courseDuration = $("#cours-eduration-classhour").val();
                                        chargeUnitPrice = $("#charge-unitprice-classhour").val();
                                    } else {
                                        courseDuration = $("#cours-eduration-month").val();
                                        chargeUnitPrice = $("#charge-unitprice-month").val();
                                    }
                                    //总价
                                    var totalprice = $("#totalprice").val();
                                    //优惠金额-可能带小数点
                                    var discountAmount = $("#discountAmount").val();
                                    //验证优惠金额
                                    if (!new RegExp("^[0-9]*$").test(discountAmount)) {
                                        discountAmount = 0;
                                        $("#receivableAmount").val(0);
                                        $("#realityAmount").val(0);
                                    }
                                    //验证课时数量或月数
                                    if (!new RegExp("^[0-9]*$").test(courseDuration)) {
                                        courseDuration = 0;
                                        $("#receivableAmount").val(0);
                                        $("#realityAmount").val(0);
                                    }
                                    //应收
                                    var receivableAmount = courseDuration * chargeUnitPrice;
                                    //实收
                                    var realityAmount = (courseDuration * chargeUnitPrice) - discountAmount;
                                    if (realityAmount <= 0) {
                                        realityAmount = 0;
                                    }
                                    //应收
                                    $("#receivableAmount").val(common.fixedMoney(receivableAmount));
                                    //总价
                                    $("#totalprice").val(common.fixedMoney(receivableAmount));
                                    //实收
                                    $("#realityAmount").val(common.fixedMoney(realityAmount));
                                },
                                clearinput: function () {
                                    $("#cours-eduration-month").val(0);
                                    $("#cours-eduration-classhour").val(0);
                                    $("#charge-unitprice-classhour").val(common.fixedMoney(0));
                                    $("#charge-unitprice-month").val(common.fixedMoney(0));
                                    $("#totalprice").val(common.fixedMoney(0));
                                    $("#receivableAmount").val(common.fixedMoney(0));
                                    $("#realityAmount").val(common.fixedMoney(0));
                                }
                            };
                            //初始化业绩归属人
                            $("#sel-salesstaff-list").empty();
                            common.ajax(setter.apiAddress.aspnetuser.list, "GET", "", "", function (res) {
                                $("#sel-salesstaff-list").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    if (item.id == data.trackingStafferId) {
                                        $("#sel-salesstaff-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.userName + "</option>");
                                    } else {
                                        $("#sel-salesstaff-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                    }
                                });
                                form.render("select");
                            });

                            //业绩归属人下拉事件
                            form.on('select(sel-salesstaff-list-filter)', function (data) {
                                studentregister.registerData.salesStaffId = data.value;
                            });

                            //初始化支付方式
                            common.ajax(setter.apiAddress.paymentmethod.list, "Get", "", {}, function (res) {
                                $("#sel-paymentmethod-list").append("<option value=\"\">请选择收款方式</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-paymentmethod-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            });
                            //支付方式下拉事件
                            form.on('select(sel-paymentmethod-list-filter)', function (data) {
                                studentregister.registerData.paymentMethodId = data.value;
                            });
                            //初始课程数据
                            common.ajax(setter.apiAddress.course.list, "GET", "", { enabledStatus: 1 }, function (res) {
                                $("#sel-course-list").append("<option value=\"\">请选择课程</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-course-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            });
                            //监听课程下拉事件
                            form.on('select(sel-course-list-filter)', function (data) {
                                studentregister.registerData.courseId = data.value;
                                //初始化选中课程的收费方式
                                common.ajax(setter.apiAddress.coursechargemanner.list, "GET", "", { courseId: data.value }, function (res) {
                                    studentregister.clearinput();
                                    //收费方式下拉列表
                                    $("#sel-course-charges-type-list").empty();
                                    $("#sel-course-charges-type-list").append("<option value=\"\">请选择</option>");
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
                                });
                            });
                            //监听并处理收费方式选择事件
                            form.on('select(sel-chargemanner-list-filter)', function (data) {
                                studentregister.registerData.chargeMannerId = data.value;
                                let chargemanner = data.elem[data.elem.selectedIndex].dataset.chargemanner;
                                //收费方式
                                $("#hid-charges-hargemanner").val(chargemanner);
                                if (chargemanner == 1) {
                                    //按课时收费购买课时数
                                    $("#course-duration-classhour-view").show();
                                    //按课时收费单价
                                    $("#charge-unitprice-classhour-view").show();
                                    //按月收费购买月数
                                    $("#course-duration-month-view").hide();
                                    //按月收费单价
                                    $("#chargeunitprice-month-view").hide();
                                    //默认购买课时数量
                                    $("#cours-eduration-classhour").val(data.elem[data.elem.selectedIndex].dataset.courseduration);
                                    //课时单价
                                    $("#charge-unitprice-classhour").val(data.elem[data.elem.selectedIndex].dataset.chargeunitprice);
                                } else {
                                    //按课时收费购买课时数
                                    $("#course-duration-classhour-view").hide();
                                    //按课时收费单价
                                    $("#charge-unitprice-classhour-view").hide();
                                    //按月收费购买月数
                                    $("#course-duration-month-view").show();
                                    //按月收费单价
                                    $("#chargeunitprice-month-view").show();
                                    //默认购买月数量
                                    $("#cours-eduration-month").val(data.elem[data.elem.selectedIndex].dataset.courseduration);
                                    //月单价
                                    $("#charge-unitprice-month").val(data.elem[data.elem.selectedIndex].dataset.chargeunitprice);
                                }
                                $("#totalprice").val(common.fixedMoney(data.elem[data.elem.selectedIndex].dataset.totalprice));
                                //计算支付信息
                                studentregister.getReceivableAmount();
                            });

                            //课时数量变化重新计算金额 sel-paymentmethod-list-filter
                            $('#cours-eduration-classhour').bind('input onkeyup', function () {
                                studentregister.getReceivableAmount();
                            });

                            //折扣数量变化重新计算金额
                            $('#discountAmount').bind('input onkeyup', function () {
                                studentregister.getReceivableAmount();
                            });

                            //监听提交
                            form.on('submit(register-form-submit)', function (datas) {
                                studentregister.registerData.noteInformation = $("#noteInformation").val();
                                //购买数量
                                if ($("#hid-charges-hargemanner").val() == 1) {
                                    studentregister.registerData.purchaseQuantity = $("#cours-eduration-classhour").val();
                                } else {
                                    studentregister.registerData.purchaseQuantity = $("#cours-eduration-month").val();
                                }
                                studentregister.registerData.receivableAmount = $("#receivableAmount").val();//应收金额
                                studentregister.registerData.discountAmount = $("#discountAmount").val();//优惠金额
                                studentregister.registerData.realityAmount = $("#realityAmount").val();//实收金额

                                common.ajax(setter.apiAddress.student.registration, "POST", "", studentregister.registerData, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        table.reload('consultrecord-table');
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

    exports('consultrecord', {})
});