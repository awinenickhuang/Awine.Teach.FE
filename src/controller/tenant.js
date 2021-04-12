/**
 @Name：机构管理
 */
layui.define(['form', 'setter', 'element', 'verification', 'laytpl'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , setter = layui.setter
        , form = layui.form
        , laytpl = layui.laytpl;
    var tenant = {
        initTenant: function () {
            admin.req({
                url: setter.apiAddress.tenant.single
                , data: {}
                , done: function (res) {
                    if (res.data) {
                        var gettpl = tenanttemplate.innerHTML
                            , view = document.getElementById('tenanttemplateview');
                        laytpl(gettpl).render(res.data, function (html) {
                            view.innerHTML = html;
                        });
                    } else {
                        layer.msg("找不到机构信息");
                    }
                }
            });
        }
    };

    tenant.initTenant();

    $(document).on('click', '.btn-tenant-edit', function (btn) {
        admin.req({
            url: setter.apiAddress.tenant.single
            , data: { id: btn.target.id }
            , done: function (res) {
                var data = res.data;
                admin.popup({
                    title: '更新机构信息'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['50%', '70%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('foundational/tenant/edit', data).done(function () {
                            form.render();
                            //加载地区信息并设置默认值
                            admin.req({
                                url: setter.apiAddress.area.getbyparentcode
                                , data: { parentCode: 0 }
                                , done: function (res) {
                                    $.each(res.data, function (index, item) {
                                        if (data.provinceId == item.code) {
                                            $("#sel-province-edit-code").append("<option selected=\"selected\" value=\"" + item.code + "\">" + item.name + "</option>");
                                        } else {
                                            $("#sel-province-edit-code").append("<option value=\"" + item.code + "\">" + item.name + "</option>");
                                        }
                                    });
                                    form.render("select");
                                    $("#province-edit-name").val($("#sel-province-edit-code").find("option:selected").text());

                                    admin.req({
                                        url: setter.apiAddress.area.getbyparentcode
                                        , data: { parentCode: data.provinceId }
                                        , done: function (res) {
                                            $.each(res.data, function (index, item) {
                                                if (data.cityId == item.code) {
                                                    $("#sel-city-edit-code").append("<option selected=\"selected\" value=\"" + item.code + "\">" + item.name + "</option>");
                                                } else {
                                                    $("#sel-city-edit-code").append("<option value=\"" + item.code + "\">" + item.name + "</option>");
                                                }
                                            });
                                            form.render("select");
                                            $("#city-edit-name").val($("#sel-city-edit-code").find("option:selected").text());
                                        }
                                    });

                                    admin.req({
                                        url: setter.apiAddress.area.getbyparentcode
                                        , data: { parentCode: data.cityId }
                                        , done: function (res) {
                                            $.each(res.data, function (index, item) {
                                                if (data.districtId == item.code) {
                                                    $("#sel-district-edit-code").append("<option selected=\"selected\" value=\"" + item.code + "\">" + item.name + "</option>");
                                                } else {
                                                    $("#sel-district-edit-code").append("<option value=\"" + item.code + "\">" + item.name + "</option>");
                                                }
                                            });
                                            form.render("select");
                                            $("#district-edit-name").val($("#sel-district-edit-code").find("option:selected").text());
                                        }
                                    });

                                    form.render("select");
                                }
                            });

                            //监听省份下拉框事件
                            form.on('select(provincefilter)', function (data) {
                                $("#province-edit-name").val($("#sel-province-edit-code").find("option:selected").text());
                                $("#sel-city-edit-code").empty();
                                $("#city-edit-name").val("");
                                $("#sel-district-edit-code").empty();
                                $("#district-edit-name").val("");
                                admin.req({
                                    url: setter.apiAddress.area.getbyparentcode
                                    , data: { parentCode: data.value }
                                    , done: function (res) {
                                        $("#sel-city-edit-code").append("<option value=\"\">请选择</option>");
                                        $.each(res.data, function (index, item) {
                                            $("#sel-city-edit-code").append("<option value=\"" + item.code + "\">" + item.name + "</option>");
                                        });
                                        form.render("select");
                                    }
                                });
                            });

                            //监听城市下拉框事件
                            form.on('select(cityfilter)', function (data) {
                                $("#city-edit-name").val($("#sel-city-edit-code").find("option:selected").text());
                                $("#sel-district-edit-code").empty();
                                $("#district-edit-name").val("");
                                admin.req({
                                    url: setter.apiAddress.area.getbyparentcode
                                    , data: { parentCode: data.value }
                                    , done: function (res) {
                                        $("#sel-district-edit-code").append("<option value=\"\">请选择</option>");
                                        $.each(res.data, function (index, item) {
                                            $("#sel-district-edit-code").append("<option value=\"" + item.code + "\">" + item.name + "</option>");
                                        });
                                        form.render("select");
                                    }
                                });
                            });

                            //监听地区下拉框事件
                            form.on('select(districtfilter)', function (data) {
                                $("#district-edit-name").val($("#sel-district-edit-code").find("option:selected").text());
                            });

                            //监听提交
                            form.on('submit(organization-edit-form-submit)', function (data) {
                                //提交数据
                                admin.req({
                                    url: setter.apiAddress.tenant.update
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        tenant.initTenant();
                                    }
                                });
                            });
                        });
                    }
                });
            }
        });
    });

    exports('tenant', {})
});