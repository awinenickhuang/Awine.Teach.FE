/**
 @Name：机构管理
 */
layui.define(['table', 'form', 'common', 'setter', 'verification', 'laydate'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , laydate = layui.laydate
        , form = layui.form;

    table.render({
        elem: '#tenant-table'
        , url: setter.apiAddress.tenant.pagelist
        , toolbar: '#tenant-toolbar'
        , cols: [[
            { field: 'name', title: '机构' },
            { field: 'industryName', width: 100, align: 'center', title: '分类' },
            { field: 'contacts', width: 100, title: '负责人' },
            { field: 'contactsPhone', width: 150, align: 'center', title: '联系方式' },
            {
                title: '地址', templet: function (d) {
                    return d.provinceName + d.cityName + d.districtName + d.address;
                }
            },
            {
                field: 'status', title: '状态', align: 'center', width: 100,
                templet: function (d) {
                    switch (d.status) {
                        case 1:
                            return '<span style="color:#009688;">正常</span>';
                            break;
                        case 2:
                            return '<span style="color:#FF5722;">锁定（异常）</span>';
                            break;
                        case 3:
                            return '<span style="color:#FFB800;">锁定（过期）</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            {
                field: 'classiFication', title: '类型', align: 'center', width: 100,
                templet: function (d) {
                    switch (d.classiFication) {
                        case 1:
                            return '<span style="color:#FFB800;">免费</span>';
                            break;
                        case 2:
                            return '<span style="color:#2F4056;">试用</span>';
                            break;
                        case 3:
                            return '<span style="color:#1E9FFF;">VIP</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            {
                field: 'vipExpirationTime', width: 200, title: '到期时间', align: 'center'
            },
            {
                field: 'createTime', width: 200, title: '创建时间', align: 'center'
            },
            {
                width: 200, title: '操作', align: 'center'
                , templet: function (d) {
                    var htmlButton = new Array();
                    htmlButton.push('<div class="layui-btn-group">')
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="edit"><i class="layui-icon layui-icon-edit"></i>编辑</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="updatestatus"><i class="layui-icon layui-icon-password"></i>状态</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="updateclassfication"><i class="layui-icon layui-icon-auz"></i>类型</a>');
                    htmlButton.push('</div>')
                    return htmlButton.join('');
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
    });

    //头工具栏事件
    table.on('toolbar(tenant-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'add':
                admin.popupRight({
                    title: '添加'
                    , area: ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('foundational/tenant/add').done(function () {

                            form.render(null, "tenant-add-form");

                            laydate.render({
                                elem: '#vipExpirationTime'
                            });

                            $("#sel-city-code").append("<option value=\"\">请选择</option>");
                            $("#sel-district-code").append("<option value=\"\">请选择</option>");

                            //省份
                            common.ajax(setter.apiAddress.area.getbyparentcode, "GET", "", { parentCode: 0 }, function (res) {
                                $("#sel-province-code").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-province-code").append("<option value=\"" + item.code + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            });
                            //城市
                            form.on('select(provincefilter)', function (data) {
                                //获取选中的省名称
                                $("#provinceName").val($("#sel-province-code").find("option:selected").text());
                                //清空市数据
                                $("#sel-city-code").empty();
                                $("#cityName").val("");

                                //清空区数据
                                $("#sel-district-code").empty();
                                $("#districtName").val("");

                                common.ajax(setter.apiAddress.area.getbyparentcode, "GET", "", { parentCode: data.value }, function (res) {
                                    $("#sel-city-code").append("<option value=\"\">请选择</option>");
                                    $("#sel-district-code").append("<option value=\"\">请选择</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-city-code").append("<option value=\"" + item.code + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                })
                            });
                            //地区
                            form.on('select(cityfilter)', function (data) {
                                //获取选中的城市名称
                                $("#cityName").val($("#sel-city-code").find("option:selected").text());
                                //清空区数据
                                $("#sel-district-code").empty();
                                $("#districtName").val("");
                                common.ajax(setter.apiAddress.area.getbyparentcode, "GET", "", { parentCode: data.value }, function (res) {
                                    $("#sel-district-code").append("<option value=\"\">请选择</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-district-code").append("<option value=\"" + item.code + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                })
                            });
                            //获取地区文本
                            form.on('select(districtfilter)', function (data) {
                                $("#districtName").val($("#sel-district-code").find("option:selected").text());
                            });

                            //所处行业
                            common.ajax(setter.apiAddress.industry.list, "GET", "", "", function (res) {
                                $("#sel-industry-list").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-industry-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            })

                            //监听提交
                            form.on('submit(tenant-form-submit)', function (data) {
                                common.ajax(setter.apiAddress.tenant.add, "POST", "", data.field, function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        layui.table.reload('tenant-table');
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

    //表格按钮事件
    table.on('tool(tenant-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'edit') {
            admin.popupRight({
                title: '编辑'
                , area: ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('foundational/tenant/edit', data).done(function () {

                        form.render();

                        //加载地区信息并设置默认值
                        common.ajax(setter.apiAddress.area.getbyparentcode, "GET", "", { parentCode: 0 }, function (res) {
                            $.each(res.data, function (index, item) {
                                if (data.provinceId == item.code) {
                                    $("#sel-province-edit-code").append("<option selected=\"selected\" value=\"" + item.code + "\">" + item.name + "</option>");
                                } else {
                                    $("#sel-province-edit-code").append("<option value=\"" + item.code + "\">" + item.name + "</option>");
                                }
                            });
                            form.render("select");
                            $("#province-edit-name").val($("#sel-province-edit-code").find("option:selected").text());

                            common.ajax(setter.apiAddress.area.getbyparentcode, "GET", "", { parentCode: data.provinceId }, function (res) {
                                $.each(res.data, function (index, item) {
                                    if (data.cityId == item.code) {
                                        $("#sel-city-edit-code").append("<option selected=\"selected\" value=\"" + item.code + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-city-edit-code").append("<option value=\"" + item.code + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                                $("#city-edit-name").val($("#sel-city-edit-code").find("option:selected").text());
                            });

                            common.ajax(setter.apiAddress.area.getbyparentcode, "GET", "", { parentCode: data.cityId }, function (res) {
                                $.each(res.data, function (index, item) {
                                    if (data.districtId == item.code) {
                                        $("#sel-district-edit-code").append("<option selected=\"selected\" value=\"" + item.code + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-district-edit-code").append("<option value=\"" + item.code + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                                $("#district-edit-name").val($("#sel-district-edit-code").find("option:selected").text());
                            });
                            form.render("select");
                        });

                        //监听省份下拉框事件
                        form.on('select(provincefilter)', function (data) {
                            $("#province-edit-name").val($("#sel-province-edit-code").find("option:selected").text());
                            $("#sel-city-edit-code").empty();
                            $("#city-edit-name").val("");
                            $("#sel-district-edit-code").empty();
                            $("#district-edit-name").val("");
                            common.ajax(setter.apiAddress.area.getbyparentcode, "GET", "", { parentCode: data.value }, function (res) {
                                $("#sel-city-edit-code").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-city-edit-code").append("<option value=\"" + item.code + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            });
                        });

                        //监听城市下拉框事件
                        form.on('select(cityfilter)', function (data) {
                            $("#city-edit-name").val($("#sel-city-edit-code").find("option:selected").text());
                            $("#sel-district-edit-code").empty();
                            $("#district-edit-name").val("");
                            common.ajax(setter.apiAddress.area.getbyparentcode, "GET", "", { parentCode: data.value }, function (res) {
                                $("#sel-district-edit-code").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    $("#sel-district-edit-code").append("<option value=\"" + item.code + "\">" + item.name + "</option>");
                                });
                                form.render("select");
                            });
                        });

                        //监听地区下拉框事件
                        form.on('select(districtfilter)', function (data) {
                            $("#district-edit-name").val($("#sel-district-edit-code").find("option:selected").text());
                        });

                        //初始化行业数据
                        common.ajax(setter.apiAddress.industry.list, "GET", "", "", function (res) {
                            $.each(res.data, function (index, item) {
                                if (data.industryId == item.id) {
                                    $("#sel-industry-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                } else {
                                    $("#sel-industry-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                }
                            });
                            form.render("select");
                        })
                        $('#sel-industry-list').val(data.industryId);
                        $('#sel-classification').val(data.classiFication);
                        $('#sel-status').val(data.status);
                        //监听提交
                        form.on('submit(organization-edit-form-submit)', function (data) {
                            common.ajax(setter.apiAddress.tenant.update, "POST", "", $("#organization-edit-form").serialize(), function (res) {
                                if (res.statusCode == 200) {
                                    layer.close(index);
                                    table.reload('tenant-table');
                                }
                                layer.msg(res.message);
                            });
                        });
                    });
                }
            });
        } else if (obj.event === 'updateclassfication') {
            admin.popup({
                title: '类型管理'
                , area: ['30%', '35%']
                , resize: false
                , success: function (layero, index) {
                    view(this.id).render('foundational/tenant/editclassfication', data).done(function () {
                        $('#sel-editclassfication-list').val(data.classiFication);
                        form.render();
                        //监听提交
                        form.on('submit(editclassfication-edit-form-submit)', function (data) {
                            common.ajax(setter.apiAddress.tenant.updateclassfication, "POST", "", $("#editclassfication-edit-form").serialize(), function (res) {
                                if (res.statusCode == 200) {
                                    layer.close(index);
                                    table.reload('tenant-table');
                                }
                                layer.msg(res.message);
                            });
                        });
                    });
                }
            });
        } else if (obj.event === 'updatestatus') {
            admin.popup({
                title: '状态管理'
                , area: ['30%', '35%']
                , resize: false
                , success: function (layero, index) {
                    view(this.id).render('foundational/tenant/editstatus', data).done(function () {
                        $('#sel-editstatus-list').val(data.status);
                        form.render();
                        //监听提交
                        form.on('submit(editstatus-edit-form-submit)', function (data) {
                            common.ajax(setter.apiAddress.tenant.updatestatus, "POST", "", $("#editstatus-edit-form").serialize(), function (res) {
                                if (res.statusCode == 200) {
                                    layer.close(index);
                                    table.reload('tenant-table');
                                }
                                layer.msg(res.message);
                            });
                        });
                    });
                }
            });
        }
    });
    exports('tenant', {})
});