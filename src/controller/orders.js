/**
 @Name：订单管理
 */
layui.define(['table', 'form', 'common', 'setter', 'element', 'verification', 'laydate'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , form = layui.form
        , laydate = layui.laydate;
    table.render({
        elem: '#orders-table'
        , url: setter.apiAddress.studentcourseorder.pagelist
        , toolbar: '#orders-toolbar'
        , cols: [[
            { field: 'courseName', title: '课程信息', rowspan: 2 }
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

    //监听启用状态开关
    form.on('switch(item-enabled-status-filter)', function (data) {
        var enabledStatus = this.checked ? 1 : 2;
        if (enabledStatus == 1) {
            layer.tips('提示：启用', data.othis, { tips: [2, '#FFB800'] })
        }
        if (enabledStatus == 2) {
            layer.tips('提示：停用', data.othis, { tips: [2, '#FFB800'] })
        }
        admin.req({
            url: setter.apiAddress.studentcourseorder.updatestatus
            , data: { Id: data.value, status: enabledStatus }
            , type: 'POST'
            , done: function (res) {
                layui.table.reload('orders-table');
            }
        });
    });

    //头工具栏事件
    table.on('toolbar(orders-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'search':
                admin.popupRight({
                    title: '搜索'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['35%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('financial/orders/search').done(function () {

                            //初始化搜索条件日期范围
                            laydate.render({
                                elem: '#daterange'
                                , range: true
                                , done: function (value, date, endDate) {
                                    if (!value) {
                                        $("#order-statr-time").val('');
                                        $("#order-end-time").val('');
                                    } else {
                                        $("#order-statr-time").val(date.year + "-" + date.month + "-" + date.date);
                                        $("#order-end-time").val(endDate.year + "-" + endDate.month + "-" + endDate.date);
                                    }
                                }
                            });

                            //初始化课程数据
                            admin.req({
                                url: setter.apiAddress.course.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-course-search-list").append("<option value=\"\">请选择课程</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-course-search-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });

                            //初始化渠道数据
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

                            //初始化员工数据
                            admin.req({
                                url: setter.apiAddress.aspnetuser.list
                                , data: { isActive: true }
                                , type: 'POST'
                                , done: function (res) {
                                    $("#sel-trackingstaffer-search-list").append("<option value=\"\">请选择员工</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-trackingstaffer-search-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                    });
                                    form.render("select");
                                }
                            });

                            //监听提交//搜索
                            form.on('submit(order-search-submit)', function (data) {
                                var field = data.field;
                                layer.close(index);
                                //执行重载
                                table.reload('orders-table', {
                                    where: {
                                        beginDate: field.BeginDate,
                                        finishDate: field.FinishDate,
                                        courseId: field.CourseId,
                                        marketingChannelId: field.MarketingchannelId,
                                        salesStaffId: field.TrackingStafferId
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
                admin.popup({
                    title: '添加'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '350%']
                    , resize: false
                    , success: function (layero, index) {
                        view(this.id).render('financial/orders/add').done(function () {
                            form.render();
                            //监听提交
                            form.on('submit(orders-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.studentcourseorder.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('orders-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    table.on('tool(orders-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                admin.req({
                    url: setter.apiAddress.studentcourseorder.delete
                    , data: { Id: data.id }
                    , type: 'POST'
                    , done: function (res) {
                        layer.close(index);
                        table.reload('orders-table');
                    }
                });
            });
        }
    });

    exports('orders', {})
});