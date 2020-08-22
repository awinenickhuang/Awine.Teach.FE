/**
 @Name：学生信息
 */
layui.define(['table', 'form', 'common', 'setter', 'element', 'verification', 'laytpl', 'laypage'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , form = layui.form
        , laytpl = layui.laytpl
        , laypage = layui.laypage
        , element = layui.element;

    var studentProfiles = {
        initStudentInformation: function () {
            //初始化学生基本信息
            common.ajax(setter.apiAddress.student.single, "GET", "", { id: layui.router().search.uid }, function (res) {
                if (res.statusCode == 200) {
                    if (res.data) {
                        var gettpl = studentprofiletemplate.innerHTML
                            , view = document.getElementById('studentprofileview');
                        laytpl(gettpl).render(res.data, function (html) {
                            view.innerHTML = html;
                        });
                    } else {
                        layer.msg("找不到你要查看的学生信息");
                    }
                } else {
                    layer.msg(res.message);
                }
            });
        },
        initStudentCourseItem: function () {
            //初始化学生购买项目-报读课程信息
            common.ajax(setter.apiAddress.studentcourseitem.list, "GET", "", { studentId: layui.router().search.uid }, function (res) {
                if (res.statusCode == 200) {
                    var gettpl = studentcoursetemplate.innerHTML
                        , view = document.getElementById('studentcoursetemplateview');
                    laytpl(gettpl).render(res.data, function (html) {
                        view.innerHTML = html;
                    });
                } else {
                    layer.msg(res.message);
                }
            });
        },
        initStudentAttendance: function () {
            table.render({
                elem: '#attendance-table'
                , url: setter.apiAddress.studentattendance.pagelist
                , cols: [[
                    { field: 'studentName', align: 'center', title: '学生姓名' },
                    { field: 'courseName', align: 'center', title: '课程名称' },
                    { field: 'className', align: 'center', title: '班级名称' },
                    {
                        field: 'attendanceStatus', title: '出勤状态', align: 'center', templet: function (d) {
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
                                    return '<span style="color:#FFB800;">/</span>';
                                    break;
                            }
                        }
                    },
                    { field: 'consumedQuantity', align: 'center', title: '扣减课时' },
                    {
                        field: 'recordStatus', title: '数据状态', align: 'center', templet: function (d) {
                            switch (d.recordStatus) {
                                case 1:
                                    return '<span style="color:#009688;">正常</span>';
                                    break;
                                case 2:
                                    return '<span style="color:#FF5722;">取消</span>';
                                    break;
                                default:
                                    return '<span style="color:#FFB800;">/</span>';
                                    break;

                            }
                        }
                    },
                    { field: 'createTime', align: 'center', title: '创建时间' }
                ]]
                , page: true
                , cellMinWidth: 80
                , text: {
                    none: '暂无相关数据'
                }
                , where: { studentId: layui.router().search.uid }
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
        initStudentCourseOrder: function () {
            table.render({
                elem: '#studentcourseorder-table'
                , url: setter.apiAddress.studentcourseorder.list
                , cols: [[
                    { field: 'courseName', align: 'center', title: '报读课程' },
                    {
                        field: 'receivableAmount', title: '应收金额（元）', align: 'center', templet: function (d) {
                            return '<span style="color:#009688;">' + common.fixedMoney(d.receivableAmount) + '</span>';
                        }
                    },
                    {
                        field: 'discountAmount', title: '优惠金额（元）', align: 'center', templet: function (d) {
                            return '<span style="color:#FFB800;">' + common.fixedMoney(d.discountAmount) + '</span>';
                        }
                    },
                    {
                        field: 'realityAmount', title: '实收金额（元）', align: 'center', templet: function (d) {
                            return '<span style="color:#FF5722;">' + common.fixedMoney(d.realityAmount) + '</span>';
                        }
                    },
                    {
                        field: 'chargeManner', title: '收费方式', align: 'center', templet: function (d) {
                            switch (d.chargeManner) {
                                case 1:
                                    return '<span style="color:#009688;">按课时收费</span>';
                                    break;
                                case 2:
                                    return '<span style="color:#FF5722;">按月收费</span>';
                                    break;
                                default:
                                    return '<span style="color:#FFB800;">/</span>';
                                    break;
                            }
                        }
                    },
                    {
                        field: 'purchaseQuantity', title: '购买数量', align: 'center', templet: function (d) {
                            switch (d.chargeManner) {
                                case 1:
                                    return '<span style="color:#2F4056;">' + d.purchaseQuantity + '（课时）</span>';
                                    break;
                                case 2:
                                    return '<span style="color:#393D49;">' + d.purchaseQuantity + '（月）</span>';
                                    break;
                                default:
                                    break;
                            }
                        }
                    },
                    { field: 'pricingStandard', align: 'center', title: '定价标准' },
                    { field: 'paymentMethodName', align: 'center', title: '支付方式' },
                    { field: 'operatorName', align: 'center', title: '经办人员' },
                    { field: 'noteInformation', align: 'center', title: '备注信息' },
                    { field: 'createTime', align: 'center', title: '创建时间' }
                ]]
                , page: false
                , cellMinWidth: 80
                , text: {
                    none: '暂无相关数据'
                }
                , where: { studentId: layui.router().search.uid }
                , response: {
                    statusCode: 200
                }
                , parseData: function (res) {
                    return {
                        "code": res.statusCode,
                        "msg": res.message,
                        "data": res.data
                    };
                }
            });
        }
    };

    studentProfiles.initStudentInformation();
    studentProfiles.initStudentCourseItem();

    //监听学生相关信息Tab切换
    element.on('tab(studentprofile-filter)', function (data) {
        switch (data.index) {
            case 1://出勤记录
                studentProfiles.initStudentAttendance();
                break;
            case 4://订单记录
                studentProfiles.initStudentCourseOrder();
                break;
        }
    });

    //续费或扩科
    $(document).on('click', '#btn-student-register', function () {
        admin.popupRight({
            title: '续费或扩科'
            , area: ['30%', '100%']
            , resize: false
            , closeBtn: 1
            , success: function (layero, index) {
                view(this.id).render('teachingaffair/student/register').done(function () {
                    form.render();
                    //初始化报名数据
                    var studentSupplement = {
                        supplementData: {
                            studentId: layui.router().search.uid,
                            courseId: '',
                            receivableAmount: 0,//应收金额
                            discountAmount: 0,//优惠金额
                            realityAmount: 0,//实收金额
                            paymentMethodId: '',//支付方式标识
                            noteInformation: '',
                            salesStaffId: '',
                            marketingChannelId: '',
                            purchaseQuantity: 0,//购买数量
                            courseChargeMannerId: ''//收费方式标识
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
                            $("#sel-salesstaff-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                        });
                        form.render("select");
                    });

                    //业绩归属人下拉事件
                    form.on('select(sel-salesstaff-list-filter)', function (data) {
                        studentSupplement.supplementData.salesStaffId = data.value;
                    });

                    //初始渠道数据
                    common.ajax(setter.apiAddress.marketingchannel.list, "GET", "", "", function (res) {
                        $("#sel-marketingchannel-list").append("<option value=\"\">请选择渠道</option>");
                        $.each(res.data, function (index, item) {
                            $("#sel-marketingchannel-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                        });
                        form.render("select");
                    });

                    //销售渠道下拉事件
                    form.on('select(sel-marketingchannel-list-filter)', function (data) {
                        studentSupplement.supplementData.marketingChannelId = data.value;
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
                        studentSupplement.supplementData.paymentMethodId = data.value;
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
                        studentSupplement.supplementData.courseId = data.value;
                        //初始化选中课程的收费方式
                        common.ajax(setter.apiAddress.coursechargemanner.list, "GET", "", { courseId: data.value }, function (res) {
                            studentSupplement.clearinput();
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
                        studentSupplement.supplementData.courseChargeMannerId = data.value;
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
                        studentSupplement.getReceivableAmount();
                    });

                    //课时数量变化重新计算金额 sel-paymentmethod-list-filter
                    $('#cours-eduration-classhour').bind('input onkeyup', function () {
                        studentSupplement.getReceivableAmount();
                    });

                    //折扣数量变化重新计算金额
                    $('#discountAmount').bind('input onkeyup', function () {
                        studentSupplement.getReceivableAmount();
                    });

                    //监听提交
                    form.on('submit(register-form-submit)', function (datas) {
                        studentSupplement.supplementData.noteInformation = $("#noteInformation").val();
                        //购买数量
                        if ($("#hid-charges-hargemanner").val() == 1) {
                            studentSupplement.supplementData.purchaseQuantity = $("#cours-eduration-classhour").val();
                        } else {
                            studentSupplement.supplementData.purchaseQuantity = $("#cours-eduration-month").val();
                        }
                        studentSupplement.supplementData.receivableAmount = $("#receivableAmount").val();//应收金额
                        studentSupplement.supplementData.discountAmount = $("#discountAmount").val();//优惠金额
                        studentSupplement.supplementData.realityAmount = $("#realityAmount").val();//实收金额
                        //提交数据
                        common.ajax(setter.apiAddress.student.supplement, "POST", "", studentSupplement.supplementData, function (res) {
                            if (res.statusCode == 200) {
                                layer.close(index);
                                studentProfiles.initStudentCourseItem();
                            }
                            layer.msg(res.message);
                        });
                    });
                });
            }
        });
    });

    exports('studentprofile', {})
});