/**
 @Name：机构管理
 */
layui.define(['table', 'form', 'common', 'setter', 'element', 'verification', 'laytpl'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , form = layui.form
        , laytpl = layui.laytpl
        , element = layui.element;

    var tenant = {
        initTenant: function () {
            common.ajax(setter.apiAddress.tenant.list, "GET", "", "", function (res) {
                if (res.statusCode == 200) {
                    if (res.data) {
                        var gettpl = tenanttemplate.innerHTML
                            , view = document.getElementById('tenanttemplateview');
                        laytpl(gettpl).render(res.data, function (html) {
                            view.innerHTML = html;
                        });
                    } else {
                        layer.msg("找不到机构信息");
                    }
                    //$("#tenanttemplateview").html(tenants.join(''));
                } else {
                    layer.msg(res.message);
                }
            });
        }
    };

    tenant.initTenant();

    $(document).on('click', '.btn-tenant-edit', function (btn) {
        common.ajax(setter.apiAddress.tenant.single, "GET", "", { id: btn.target.id }, function (res) {
            let data = res.data;
            if (res.statusCode == 200) {
                admin.popup({
                    title: '更新机构信息'
                    , area: ['50%', '65%']
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

                            //监听提交
                            form.on('submit(organization-edit-form-submit)', function (data) {
                                //提交数据
                                common.ajax(setter.apiAddress.tenant.update, "POST", "", $("#organization-edit-form").serialize(), function (res) {
                                    if (res.statusCode == 200) {
                                        layer.close(index);
                                        tenant.initTenant();
                                    }
                                    layer.msg(res.message);
                                });
                            });
                        });
                    }
                });
            } else {
                layer.msg(res.message);
            }
        });
    });

    exports('tenant', {})
});