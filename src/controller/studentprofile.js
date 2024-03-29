﻿/**
 @Name：学生信息
 */
layui.define(['table', 'form', 'common', 'setter', 'element', 'verification', 'laytpl', 'tinymce'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , form = layui.form
        , laytpl = layui.laytpl
        , element = layui.element
        , tinymce = layui.tinymce;

    //定义一个在线编辑器
    var onlineEditor;

    var studentProfiles = {
        //学生信息
        initStudentInformation: function () {
            admin.req({
                url: setter.apiAddress.student.single
                , data: { id: window.atob(layui.router().search.uid) }
                , done: function (res) {
                    if (res.data) {
                        var gettpl = studentprofiletemplate.innerHTML
                            , view = document.getElementById('studentprofileview');
                        laytpl(gettpl).render(res.data, function (html) {
                            view.innerHTML = html;
                        });
                    } else {
                        layer.msg("找不到你要查看的学生信息");
                    }
                }
            });
        },
        //报读课程
        initStudentCourseItem: function () {
            table.render({
                elem: '#studentcourseorderitem-table'
                , url: setter.apiAddress.studentcourseitem.pagelist
                , toolbar: '#studentcourseorderitem-toolbar'
                , cols: [[
                    { type: 'radio', rowspan: 2 }
                    , { field: 'courseName', align: 'center', title: '报读课程', rowspan: 2 }
                    , { field: 'classesName', align: 'center', title: '就读班级', rowspan: 2 }
                    , {
                        field: 'purchaseQuantity', title: '购买数量', align: 'center', rowspan: 2, templet: function (d) {
                            switch (d.chargeManner) {
                                case 1:
                                    return '<span style="color:#009688;">' + d.purchaseQuantity + '（课时）</span>';
                                    break;
                                case 2:
                                    return '<span style="color:#FF5722;">' + d.purchaseQuantity + '（月）</span>';
                                    break;
                                default:
                                    return '<span style="color:#FFB800;">/</span>';
                                    break;
                            }
                        }
                    }
                    , {
                        field: 'purchaseQuantity', title: '已消耗数量', align: 'center', rowspan: 2, templet: function (d) {
                            switch (d.chargeManner) {
                                case 1:
                                    return '<span style="color:#009688;">' + d.consumedQuantity + '（课时）</span>';
                                    break;
                                case 2:
                                    return '<span style="color:#FF5722;">' + d.consumedQuantity + '（月）</span>';
                                    break;
                                default:
                                    return '<span style="color:#FFB800;">/</span>';
                                    break;
                            }
                        }
                    }
                    , {
                        field: 'purchaseQuantity', title: '剩余数量', align: 'center', rowspan: 2, templet: function (d) {
                            switch (d.chargeManner) {
                                case 1:
                                    return '<span style="color:#009688;">' + d.remainingNumber + '（课时）</span>';
                                    break;
                                case 2:
                                    return '<span style="color:#FF5722;">' + d.remainingNumber + '（月）</span>';
                                    break;
                                default:
                                    return '<span style="color:#FFB800;">/</span>';
                                    break;
                            }
                        }
                    }
                    , {
                        field: 'learningProcess', title: '学习进度', align: 'center', rowspan: 2, width: 150, templet: function (d) {
                            switch (d.learningProcess) {
                                case 1:
                                    return '<span style="color:#FF6600;">已报名（未分班）</span>';
                                    break;
                                case 2:
                                    return '<span style="color:#009933;">已报名（已分班）</span>';
                                    break;
                                case 3:
                                    return '<span style="color:#CC3399;">停课</span>';
                                    break;
                                case 4:
                                    return '<span style="color:#CC6600;">退费</span>';
                                    break;
                                case 5:
                                    return '<span style="color:#666699;">毕业</span>';
                                    break;
                                default:
                                    return '<span style="color:#FF6666;">/</span>';
                                    break;
                            }
                        }
                    }
                    , { align: 'center', title: '定价标准', colspan: 4 }
                    , { field: 'createTime', align: 'center', title: '报名时间', rowspan: 2 }
                ], [
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
                    }
                    , {
                        field: 'courseDuration', title: '定价方式', align: 'center', templet: function (d) {
                            switch (d.chargeManner) {
                                case 1:
                                    return '<span style="color:#2F4056;">' + d.courseDuration + '（课时）</span>';
                                    break;
                                case 2:
                                    return '<span style="color:#393D49;">' + d.courseDuration + '（月）</span>';
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                    , {
                        field: 'totalPrice', title: '总价（元）', align: 'center', templet: function (d) {
                            return '<span style="color:#FF5722;">' + common.fixedMoney(d.totalPrice) + '</span>';
                        }
                    }
                    , {
                        field: 'unitPrice', title: '单价（元）', align: 'center', templet: function (d) {
                            return '<span style="color:#FF5722;">' + common.fixedMoney(d.unitPrice) + '</span>';
                        }
                    }
                ]]
                , page: true
                , cellMinWidth: 80
                , text: {
                    none: '暂无相关数据'
                }
                , where: { studentId: window.atob(layui.router().search.uid) }
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
        //上课记录
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
                , where: { studentId: window.atob(layui.router().search.uid) }
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
        //成长档案
        initGrowthRecord: function () {
            table.render({
                elem: '#growthrecord-table'
                , url: setter.apiAddress.studentgrowthrecord.pagelist
                , toolbar: '#growthrecord-toolbar'
                , cols: [[
                    { type: 'radio' },
                    { field: 'studentName', width: 150, title: '学生' },
                    { field: 'topics', title: '主题' },
                    { field: 'viewCount', width: 100, align: 'center', title: '浏览次数' },
                    { field: 'creatorName', width: 100, align: 'center', title: '创建人' },
                    { field: 'createTime', width: 200, align: 'center', title: '创建时间' }
                ]]
                , page: true
                , cellMinWidth: 80
                , where: { studentId: window.atob(layui.router().search.uid) }
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
        },
        //订单信息
        initStudentCourseOrder: function () {
            table.render({
                elem: '#studentcourseorder-table'
                , url: setter.apiAddress.studentcourseorder.pagelist
                , cols: [[
                    { field: 'courseName', align: 'center', title: '报读课程', rowspan: 2 }
                    , {
                        field: 'receivableAmount', title: '应收（元）', align: 'center', rowspan: 2, templet: function (d) {
                            return '<span style="color:#009688;">' + common.fixedMoney(d.receivableAmount) + '</span>';
                        }
                    }
                    , {
                        field: 'discountAmount', title: '优惠（元）', align: 'center', rowspan: 2, templet: function (d) {
                            return '<span style="color:#FFB800;">' + common.fixedMoney(d.discountAmount) + '</span>';
                        }
                    }
                    , {
                        field: 'realityAmount', title: '实收（元）', align: 'center', rowspan: 2, templet: function (d) {
                            return '<span style="color:#FF5722;">' + common.fixedMoney(d.realityAmount) + '</span>';
                        }
                    }
                    , {
                        field: 'purchaseQuantity', title: '购买数量', align: 'center', rowspan: 2, templet: function (d) {
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
                    }
                    , { field: 'paymentMethodName', align: 'center', title: '支付方式', rowspan: 2 }
                    , { field: 'operatorName', align: 'center', title: '经办人员', rowspan: 2 }
                    , {
                        field: 'noteInformation', title: '备注信息', align: 'center', rowspan: 2, templet: function (d) {
                            if (d.noteInformation === null) {
                                return '<span style="color:#2F4056;">——</span>';
                            }
                            return d.noteInformation;
                        }
                    }
                    , { align: 'center', title: '定价标准', colspan: 4 }
                    , { field: 'createTime', align: 'center', title: '创建时间', rowspan: 2, fixed: 'right' }
                ], [
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
                    }
                    , {
                        field: 'courseDuration', title: '定价方式', align: 'center', templet: function (d) {
                            switch (d.chargeManner) {
                                case 1:
                                    return '<span style="color:#2F4056;">' + d.courseDuration + '（课时）</span>';
                                    break;
                                case 2:
                                    return '<span style="color:#393D49;">' + d.courseDuration + '（月）</span>';
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                    , {
                        field: 'totalPrice', title: '总价（元）', align: 'center', templet: function (d) {
                            return '<span style="color:#FF5722;">' + common.fixedMoney(d.totalPrice) + '</span>';
                        }
                    }
                    , {
                        field: 'unitPrice', title: '单价（元）', align: 'center', templet: function (d) {
                            return '<span style="color:#FF5722;">' + common.fixedMoney(d.unitPrice) + '</span>';
                        }
                    }
                ]]
                , page: true
                , cellMinWidth: 80
                , text: {
                    none: '暂无相关数据'
                }
                , where: { studentId: window.atob(layui.router().search.uid) }
                , response: {
                    statusCode: 200
                }
                , parseData: function (res) {
                    return {
                        "code": res.statusCode,
                        "msg": res.message,
                        "data": res.data.items
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
            case 2://成长档案
                studentProfiles.initGrowthRecord();
                break;
            case 4://订单记录
                studentProfiles.initStudentCourseOrder();
                break;
        }
    });

    //报读课程头工具栏事件
    table.on('toolbar(studentcourseorderitem-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'renewal'://续费
                var data = checkStatus.data;
                if (data.length == 0) {
                    layer.msg('请选择报读课程', { icon: 5 });
                    return;
                }
                admin.popupRight({
                    title: '续费'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/student/paycost').done(function () {

                            let currentdata = data[0];

                            var continuetopaytuition = {
                                //计算函数
                                computationalCosts: function () {
                                    //验证优惠金额
                                    if (!new RegExp("^-?[0-9]+([\.]{0,1}[0-9]{1,2})?$").test(continuetopaytuition.renewalData.discountAmount)) {
                                        continuetopaytuition.renewalData.discountAmount = 0;
                                    }
                                    //应收
                                    var receivableAmount = continuetopaytuition.renewalData.purchaseQuantity * currentdata.unitPrice;
                                    $("#receivableAmount").val(common.fixedMoney(receivableAmount));
                                    continuetopaytuition.renewalData.receivableAmount = receivableAmount;
                                    //实收
                                    var realityAmount = receivableAmount - continuetopaytuition.renewalData.discountAmount;
                                    if (realityAmount <= 0) {
                                        realityAmount = 0;
                                    }
                                    //实收
                                    $("#realityAmount").val(common.fixedMoney(realityAmount));
                                    continuetopaytuition.renewalData.realityAmount = realityAmount;
                                },
                                assistData: {
                                    chargemanner: 1,                                           //收费方式
                                    unitPrice: 0,                                              //课程单价
                                    totalPrice: 0,                                             //课程总价
                                },
                                //初始化报名数据
                                renewalData: {
                                    studentId: window.atob(layui.router().search.uid),
                                    orderItemId: currentdata.id,                               //续费课程
                                    purchaseQuantity: 1,                                       //购买数量
                                    receivableAmount: currentdata.unitPrice,                   //应收金额
                                    discountAmount: 0,                                         //优惠金额
                                    realityAmount: currentdata.unitPrice,                      //实收金额
                                    paymentMethodId: '',                                       //支付方式标识
                                    noteInformation: '',                                       //备注
                                    salesStaffId: '',                                          //业绩
                                    salesStaffName: '',                                        //业绩
                                    marketingChannelId: '',                                    //营销渠道
                                    purchaseQuantity: 1,                                       //购买数量
                                },
                            };

                            //初始化课程名称
                            $("#courseName").val(currentdata.courseName);

                            //初始化报名课程的收费方式
                            admin.req({
                                url: setter.apiAddress.coursechargemanner.list
                                , data: { courseId: currentdata.courseId }
                                , type: 'GET'
                                , done: function (res) {
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

                            //收费方式选择事件
                            form.on('select(sel-chargemanner-list-filter)', function (data) {

                                //记录收费方式ID
                                continuetopaytuition.renewalData.chargeMannerId = data.value;

                                //记录收费方式
                                continuetopaytuition.assistData.chargemanner = data.elem[data.elem.selectedIndex].dataset.chargemanner;

                                //购买数量
                                $("#purchaseQuantity").val(data.elem[data.elem.selectedIndex].dataset.courseduration);
                                continuetopaytuition.renewalData.purchaseQuantity = data.elem[data.elem.selectedIndex].dataset.courseduration;

                                //课程单价
                                $("#unitPrice").val(common.fixedMoney(data.elem[data.elem.selectedIndex].dataset.chargeunitprice));
                                continuetopaytuition.assistData.unitPrice = data.elem[data.elem.selectedIndex].dataset.chargeunitprice;

                                //优惠金额
                                $("#discountAmount").val(common.fixedMoney(0));
                                continuetopaytuition.renewalData.discountAmount = 0;

                                //课程总价
                                $("#totalPrice").val(common.fixedMoney(data.elem[data.elem.selectedIndex].dataset.totalprice));
                                continuetopaytuition.assistData.totalPrice = data.elem[data.elem.selectedIndex].dataset.totalprice;

                                //计算支付信息
                                continuetopaytuition.computationalCosts();
                            });

                            //折扣数量变化重新计算金额
                            $('#discountAmount').bind('input onkeyup', function () {
                                var value = this.value;
                                continuetopaytuition.renewalData.discountAmount = value;
                                continuetopaytuition.computationalCosts();
                            });

                            //折扣数量变化重新计算金额
                            $("#discountAmount").blur(function () {
                                var value = this.value;
                                var node = this;
                                node.value = common.fixedMoney(node.value);
                                continuetopaytuition.renewalData.discountAmount = value;
                                continuetopaytuition.computationalCosts();
                            });

                            //初始化业绩归属人
                            $("#sel-salesstaff-list").empty();
                            admin.req({
                                url: setter.apiAddress.aspnetuser.list
                                , data: { isActive: true }
                                , type: 'GET'
                                , done: function (res) {
                                    $("#sel-salesstaff-list").append("<option value=\"\">请选择业绩归属人</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-salesstaff-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                    });
                                    form.render("select");
                                }
                            });

                            //业绩归属人下拉事件
                            form.on('select(sel-salesstaff-list-filter)', function (data) {
                                continuetopaytuition.renewalData.salesStaffId = data.value;
                                continuetopaytuition.renewalData.salesStaffName = data.elem[data.elem.selectedIndex].text;
                            });

                            //初始渠道数据
                            admin.req({
                                url: setter.apiAddress.marketingchannel.list
                                , data: {}
                                , type: 'GET'
                                , done: function (res) {
                                    $("#sel-marketingchannel-list").append("<option value=\"\">请选择营销渠道</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-marketingchannel-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });

                            //销售渠道下拉事件
                            form.on('select(sel-marketingchannel-list-filter)', function (data) {
                                continuetopaytuition.renewalData.marketingChannelId = data.value;
                            });

                            //初始化支付方式
                            admin.req({
                                url: setter.apiAddress.paymentmethod.list
                                , data: {}
                                , type: 'Get'
                                , done: function (res) {
                                    $("#sel-paymentmethod-list").append("<option value=\"\">请选择收款方式</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-paymentmethod-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });

                            //支付方式下拉事件
                            form.on('select(sel-paymentmethod-list-filter)', function (data) {
                                continuetopaytuition.renewalData.paymentMethodId = data.value;
                            });

                            //监听提交
                            form.on('submit(continuetopaytuition-form-submit)', function (data) {
                                continuetopaytuition.renewalData.noteInformation = $("#noteInformation").val();
                                admin.req({
                                    url: setter.apiAddress.student.continuetopaytuition
                                    , data: continuetopaytuition.renewalData
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        studentProfiles.initStudentCourseItem();
                                    }
                                });
                            });
                        });
                    }
                });
                break;
            case 'shutoutofschool'://停课
                var data = checkStatus.data;
                if (data.length == 0) {
                    layer.msg('请选择报读课程', { icon: 5 });
                    return;
                }
                break;
            case 'refund'://退费
                var data = checkStatus.data;
                if (data.length == 0) {
                    layer.msg('请选择报读课程', { icon: 5 });
                    return;
                }
                admin.popupRight({
                    title: '退费'
                    , area: ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/student/refund').done(function () {

                        });
                    }
                });
                break;
            case 'graduation'://毕业
                var data = checkStatus.data;
                if (data.length == 0) {
                    layer.msg('请选择报读课程', { icon: 5 });
                    return;
                }
                let currentdata = data[0];
                layer.confirm('将对【' + currentdata.courseName + '】进行结课毕业操作，确定？', { icon: 3 }, function (index) {
                    admin.req({
                        url: setter.apiAddress.studentcourseitem.updatelearningprocess
                        , data: { Id: currentdata.id, learningProcess: 4 }
                        , type: 'POST'
                        , done: function (res) {
                            layer.close(index);
                            studentProfiles.initStudentCourseItem();
                        }
                    });
                });
                break;
        };
    });

    //成长档案
    table.on('toolbar(growthrecord-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'add'://添加
                admin.popup({
                    title: '成长档案'
                    , area: ['100%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/student/addgrowthrecord').done(function () {
                            $("#studentId").val(window.atob(layui.router().search.uid));
                            form.render();
                            onlineEditor = tinymce.render({
                                elem: "#onlineEditor"
                                , height: 550
                                , width: '100%'
                                , content_style: "img {max-width:100%;}"
                                , skin: 'oxide'//或oxide-dark
                                , cache_suffix: new Date().getTime().toString()
                                , images_upload_handler: function (blobInfo, succFun, failFun) {
                                    var xhr, formData;
                                    var file = blobInfo.blob();
                                    xhr = new XMLHttpRequest();
                                    xhr.withCredentials = false;
                                    xhr.open('POST', setter.apiAddress.filemanagement.tencentcosupload);//上传文件地址
                                    xhr.onload = function () {
                                        var json;
                                        if (xhr.status != 200) {
                                            failFun('上传出错: ' + xhr.status);
                                            return;
                                        }
                                        json = JSON.parse(xhr.responseText);
                                        if (!json || json.statusCode != 200) {
                                            failFun('上传出错: ' + xhr.responseText);
                                            return;
                                        }
                                        var fullImgUrl = json.data.uploadedUri;
                                        succFun(fullImgUrl);
                                    };
                                    formData = new FormData();
                                    formData.append('file', file, file.name);
                                    xhr.send(formData);
                                }
                                , init_instance_callback: function (editor) {
                                    console.log("ID为: " + editor.id + " 的编辑器已初始化完成.");
                                }
                            });

                            //监听提交
                            form.on('submit(growthrecord-add-form-submit)', function (data) {
                                data.field.Contents = onlineEditor.getContent();
                                if (!data.field.Contents) {
                                    layer.msg("学生成长档案的内容是空的哦 ^_^", { icon: 5 });
                                    return;
                                }
                                admin.req({
                                    url: setter.apiAddress.studentgrowthrecord.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('growthrecord-table');
                                    }
                                });
                            });

                        });
                    }
                }, function () {
                    // 只要弹窗关闭了就销毁编辑器，避免第二次无法加载的问题
                    onlineEditor.destroy();
                });
                break;
            case 'edit'://修改
                var data = checkStatus.data;
                if (data.length == 0) {
                    layer.msg('请选择学生成长档案 ^_^', { icon: 5 });
                    return;
                }
                let currentrecord = data[0];
                admin.popup({
                    title: '成长档案'
                    , area: ['100%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/student/editgrowthrecord', currentrecord).done(function () {
                            onlineEditor = tinymce.render({
                                elem: "#onlineEditor"
                                , height: 550
                                , width: '100%'
                                , content_style: "img {max-width:100%;}"
                                , skin: 'oxide'//或oxide-dark
                                , cache_suffix: new Date().getTime().toString()
                                , images_upload_handler: function (blobInfo, succFun, failFun) {
                                    var xhr, formData;
                                    var file = blobInfo.blob();
                                    xhr = new XMLHttpRequest();
                                    xhr.withCredentials = false;
                                    xhr.open('POST', setter.apiAddress.filemanagement.tencentcosupload);//上传文件地址
                                    xhr.onload = function () {
                                        var json;
                                        if (xhr.status != 200) {
                                            failFun('上传出错: ' + xhr.status);
                                            return;
                                        }
                                        json = JSON.parse(xhr.responseText);
                                        if (!json || json.statusCode != 200) {
                                            failFun('上传出错: ' + xhr.responseText);
                                            return;
                                        }
                                        var fullImgUrl = json.data.uploadedUri;
                                        succFun(fullImgUrl);
                                    };
                                    formData = new FormData();
                                    formData.append('file', file, file.name);
                                    xhr.send(formData);
                                }
                                , init_instance_callback: function (editor) {
                                    console.log("ID为: " + editor.id + " 的编辑器已初始化完成.");
                                    onlineEditor.setContent(currentrecord.contents);
                                }
                            });

                            //监听提交
                            form.on('submit(growthrecord-edit-form-submit)', function (data) {
                                data.field.Contents = onlineEditor.getContent();
                                if (!data.field.Contents) {
                                    layer.msg("学生成长档案的内容是空的哦 ^_^", { icon: 5 });
                                    return;
                                }
                                admin.req({
                                    url: setter.apiAddress.studentgrowthrecord.update
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('growthrecord-table');
                                    }
                                });
                            });

                        });
                    }
                }, function () {
                    // 只要弹窗关闭了就销毁编辑器，避免第二次无法加载的问题
                    onlineEditor.destroy();
                });
                break;
            case 'view'://预览
                var data = checkStatus.data;
                if (data.length == 0) {
                    layer.msg('请选择学生成长档案 ^_^', { icon: 5 });
                    return;
                }
                admin.popup({
                    title: '成长档案'
                    , area: ['100%', '100%']
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('mschool/growthrecord/details', data[0]).done(function () {

                        });
                    }
                });
                break;
            case 'del'://删除
                var data = checkStatus.data;
                if (data.length == 0) {
                    layer.msg('请选择学生成长档案 ^_^', { icon: 5 });
                    return;
                }
                let currentdata = data[0];
                layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                    admin.req({
                        url: setter.apiAddress.studentgrowthrecord.delete
                        , data: { Id: currentdata.id }
                        , type: 'POST'
                        , done: function (res) {
                            if (res.code == 0) {
                                layer.msg(res.msg, { icon: 6 });
                                layer.close(index);
                                table.reload('growthrecord-table');
                            } else {
                                layer.msg(res.msg, { icon: 5 });
                            }
                        }
                    });
                });
                break;
            default:
                layer.msg('操作有误', { icon: 5 });
                break;
        };
    });

    //扩科
    $(document).on('click', '#btn-student-register', function () {
        admin.popupRight({
            title: '扩科'
            , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
            , resize: false
            , closeBtn: 1
            , success: function (layero, index) {
                view(this.id).render('teaching/student/register').done(function () {
                    form.render();
                    //初始化报名数据
                    var increaseLearningCourses = {
                        assistData: {
                            chargemanner: 1,                                 //收费方式
                            unitPrice: 0,                                    //课程单价
                            totalPrice: 0,                                   //课程总价
                        },
                        increaseLearningCoursesData: {
                            studentId: window.atob(layui.router().search.uid),
                            courseId: '',                                    //课程
                            receivableAmount: 0,                             //应收金额
                            discountAmount: 0,                               //优惠金额
                            realityAmount: 0,                                //实收金额
                            paymentMethodId: '',                             //支付方式标识
                            noteInformation: '',                             //备注
                            salesStaffId: '',                                //业绩
                            salesStaffName: '',                              //业绩
                            marketingChannelId: '',                          //营销渠道
                            purchaseQuantity: 0,                             //购买数量
                            chargeMannerId: ''                               //收费方式标识
                        },
                        //费用计算
                        computationalCosts: function () {
                            //验证优惠金额
                            if (!new RegExp("^-?[0-9]+([\.]{0,1}[0-9]{1,2})?$").test(increaseLearningCourses.increaseLearningCoursesData.discountAmount)) {
                                increaseLearningCourses.increaseLearningCoursesData.discountAmount = 0;
                            }
                            //验证购买数量
                            if (!new RegExp("^[0-9]*$").test(increaseLearningCourses.increaseLearningCoursesData.purchaseQuantity)) {
                                increaseLearningCourses.increaseLearningCoursesData.purchaseQuantity = 0;
                            }
                            //应收金额
                            var receivableAmount = increaseLearningCourses.increaseLearningCoursesData.purchaseQuantity * increaseLearningCourses.assistData.unitPrice;
                            //实收金额
                            var realityAmount = receivableAmount - increaseLearningCourses.increaseLearningCoursesData.discountAmount;
                            if (realityAmount <= 0) {
                                realityAmount = 0;
                            }
                            //应收金额
                            $("#receivableAmount").val(common.fixedMoney(receivableAmount));
                            increaseLearningCourses.increaseLearningCoursesData.receivableAmount = receivableAmount;
                            //实收金额
                            $("#realityAmount").val(common.fixedMoney(realityAmount));
                            increaseLearningCourses.increaseLearningCoursesData.realityAmount = realityAmount;
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
                        , type: 'GET'
                        , done: function (res) {
                            $("#sel-salesstaff-list").append("<option value=\"\">请选择业绩归属人</option>");
                            $.each(res.data, function (index, item) {
                                $("#sel-salesstaff-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                            });
                            form.render("select");
                        }
                    });

                    //业绩归属人下拉事件
                    form.on('select(sel-salesstaff-list-filter)', function (data) {
                        increaseLearningCourses.increaseLearningCoursesData.salesStaffId = data.value;
                        increaseLearningCourses.increaseLearningCoursesData.salesStaffName = data.elem[data.elem.selectedIndex].text;
                    });

                    //初始渠道数据
                    admin.req({
                        url: setter.apiAddress.marketingchannel.list
                        , data: {}
                        , type: 'GET'
                        , done: function (res) {
                            $("#sel-marketingchannel-list").append("<option value=\"\">请选择营销渠道</option>");
                            $.each(res.data, function (index, item) {
                                $("#sel-marketingchannel-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                            });
                            form.render("select");
                        }
                    });

                    //销售渠道下拉事件
                    form.on('select(sel-marketingchannel-list-filter)', function (data) {
                        increaseLearningCourses.increaseLearningCoursesData.marketingChannelId = data.value;
                    });

                    //初始化支付方式
                    admin.req({
                        url: setter.apiAddress.paymentmethod.list
                        , data: {}
                        , type: 'Get'
                        , done: function (res) {
                            $("#sel-paymentmethod-list").append("<option value=\"\">请选择收款方式</option>");
                            $.each(res.data, function (index, item) {
                                $("#sel-paymentmethod-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                            });
                            form.render("select");
                        }
                    });

                    //支付方式下拉事件
                    form.on('select(sel-paymentmethod-list-filter)', function (data) {
                        increaseLearningCourses.increaseLearningCoursesData.paymentMethodId = data.value;
                    });

                    //初始课程数据
                    admin.req({
                        url: setter.apiAddress.course.list
                        , data: { enabledStatus: 1 }
                        , type: 'GET'
                        , done: function (res) {
                            $("#sel-course-list").append("<option value=\"\">请选择课程</option>");
                            $.each(res.data, function (index, item) {
                                $("#sel-course-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                            });
                            form.render("select");
                        }
                    });

                    //监听课程下拉事件
                    form.on('select(sel-course-list-filter)', function (data) {

                        //清空输入
                        increaseLearningCourses.clearInput();

                        //记录课程ID
                        increaseLearningCourses.increaseLearningCoursesData.courseId = data.value;

                        //初始化选中课程的收费方式
                        admin.req({
                            url: setter.apiAddress.coursechargemanner.list
                            , data: { courseId: data.value }
                            , type: 'GET'
                            , done: function (res) {
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
                            }
                        });
                    });

                    //监听并处理收费方式选择事件
                    form.on('select(sel-chargemanner-list-filter)', function (data) {

                        //记录支付方式ID
                        increaseLearningCourses.increaseLearningCoursesData.chargeMannerId = data.value;

                        //收费方式
                        increaseLearningCourses.assistData.chargemanner = data.elem[data.elem.selectedIndex].dataset.chargemanner;

                        //购买数量
                        increaseLearningCourses.increaseLearningCoursesData.purchaseQuantity = data.elem[data.elem.selectedIndex].dataset.courseduration;
                        $("#purchaseQuantity").val(data.elem[data.elem.selectedIndex].dataset.courseduration);

                        //课程单价
                        increaseLearningCourses.assistData.unitPrice = data.elem[data.elem.selectedIndex].dataset.chargeunitprice;
                        $("#unitPrice").val(common.fixedMoney(data.elem[data.elem.selectedIndex].dataset.chargeunitprice));

                        //优惠金额
                        increaseLearningCourses.increaseLearningCoursesData.discountAmount = 0;
                        $("#discountAmount").val(common.fixedMoney(0));

                        //课程总价
                        increaseLearningCourses.assistData.totalPrice = data.elem[data.elem.selectedIndex].dataset.totalprice;
                        $("#totalPrice").val(common.fixedMoney(data.elem[data.elem.selectedIndex].dataset.totalprice));

                        //计算支付信息
                        increaseLearningCourses.computationalCosts();
                    });

                    //折扣数量变化重新计算金额
                    $('#discountAmount').bind('input onkeyup', function () {
                        var value = this.value;
                        increaseLearningCourses.increaseLearningCoursesData.discountAmount = value;
                        increaseLearningCourses.computationalCosts();
                    });

                    //折扣金额失去焦点时格式金额
                    $("#discountAmount").blur(function () {
                        var value = this.value;
                        var node = this;
                        node.value = common.fixedMoney(node.value);
                        increaseLearningCourses.increaseLearningCoursesData.discountAmount = value;
                        increaseLearningCourses.computationalCosts();
                    })

                    //监听提交
                    form.on('submit(register-form-submit)', function (datas) {
                        increaseLearningCourses.increaseLearningCoursesData.noteInformation = $("#noteInformation").val();
                        //提交数据
                        admin.req({
                            url: setter.apiAddress.student.increaselearningcourses
                            , data: increaseLearningCourses.increaseLearningCoursesData
                            , type: 'POST'
                            , done: function (res) {
                                layer.close(index);
                                studentProfiles.initStudentCourseItem();
                            }
                        });
                    });
                });
            }
        });
    });

    exports('studentprofile', {})
});