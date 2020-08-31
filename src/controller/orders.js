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
        , element = layui.element
        , laydate = layui.laydate;

    form.render();

    /*-------------------------------搜索功能--------------------------------*/
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
    common.ajax(setter.apiAddress.course.list, "Get", "", {}, function (res) {
        $("#sel-course-search-list").append("<option value=\"\">请选择课程</option>");
        $.each(res.data, function (index, item) {
            $("#sel-course-search-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
        });
        form.render("select");
    });

    //初始化渠道数据
    common.ajax(setter.apiAddress.marketingchannel.list, "Get", "", {}, function (res) {
        $("#sel-marketingchannel-search-list").append("<option value=\"\">请选择渠道</option>");
        $.each(res.data, function (index, item) {
            $("#sel-marketingchannel-search-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
        });
        form.render("select");
    });

    //初始化员工数据
    common.ajax(setter.apiAddress.aspnetuser.list, "GET", "", { enableStatus: 1 }, function (res) {
        $("#sel-trackingstaffer-search-list").append("<option value=\"\">请选择员工</option>");
        $.each(res.data, function (index, item) {
            $("#sel-trackingstaffer-search-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
        });
        form.render("select");
    });

    //搜索
    form.on('submit(orders-search)', function (data) {
        var field = data.field;
        //执行重载
        table.reload('orders-table', {
            where: {
                beginDate: $("#order-statr-time").val(),
                finishDate: $("#order-end-time").val(),
                courseId: $("#sel-course-search-list").val(),
                marketingChannelId: $("#sel-marketingchannel-search-list").val(),
                salesStaffId: $("#sel-trackingstaffer-search-list").val(),
            },
            page: {
                curr: 1 //重新从第 1 页开始
            }
        });
    });
    /*-------------------------------搜索功能--------------------------------*/

    table.render({
        elem: '#orders-table'
        , url: setter.apiAddress.studentcourseorder.pagelist
        , toolbar: '#orders-toolbar'
        , cols: [[
            { field: 'courseName', align: 'center', title: '课程信息' },
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
            {
                field: 'noteInformation', title: '备注信息', align: 'center', templet: function (d) {
                    if (d.noteInformation === null) {
                        return '<span style="color:#2F4056;">——</span>';
                    }
                    return d.noteInformation;
                }
            },
            { field: 'createTime', align: 'center', title: '创建时间' }
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

    //监听启用状态开关
    form.on('switch(item-enabled-status-filter)', function (data) {
        var enabledStatus = this.checked ? 1 : 2;
        if (enabledStatus == 1) {
            layer.tips('提示：启用', data.othis, { tips: [2, '#FFB800'] })
        }
        if (enabledStatus == 2) {
            layer.tips('提示：停用', data.othis, { tips: [2, '#FFB800'] })
        }
        common.ajax(setter.apiAddress.studentcourseorder.updatestatus, "POST", "", { Id: data.value, status: enabledStatus }, function (res) {
            if (res.statusCode == 200) {
                layui.table.reload('orders-table');
            }
            layer.msg(res.message);
        });
    });

    //头工具栏事件
    table.on('toolbar(orders-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'add':
                admin.popup({
                    title: '添加'
                    , area: ['30%', '35%']
                    , resize: false
                    , success: function (layero, index) {
                        view(this.id).render('financial/orders/add').done(function () {
                            form.render();
                            //监听提交
                            form.on('submit(orders-form-submit)', function (data) {
                                common.ajax(setter.apiAddress.studentcourseorder.add, "POST", "", data.field, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        table.reload('orders-table');
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

    table.on('tool(orders-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                common.ajax(setter.apiAddress.studentcourseorder.delete, "POST", "", { Id: data.id }, function (res) {
                    if (res.statusCode == 200) {
                        layer.close(index);
                        table.reload('orders-table');
                    }
                    layer.msg(res.message);
                });
            });
        }
    });

    exports('orders', {})
});