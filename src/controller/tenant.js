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

    common.ajax(setter.apiAddress.tenant.list, "GET", "", "", function (res) {
        if (res.statusCode == 200) {
            if (res.data) {
                var gettpl = tenanttemplate.innerHTML
                    , view = document.getElementById('tenanttemplateview');
                laytpl(gettpl).render(res.data, function (html) {
                    view.innerHTML = html;
                });
            } else {
                layer.msg("找不到你要查看的学生信息");
            }
            //$("#tenanttemplateview").html(tenants.join(''));
        } else {
            layer.msg(res.message);
        }
    });

    $(document).on('click', '#btn-tenant-edit', function () {
        admin.popup({
            title: '更新机构信息'
            , area: ['50%', '65%']
            , resize: false
            , closeBtn: 1
            , success: function (layero, index) {
                view(this.id).render('foundational/tenant/edit').done(function () {
                    form.render();
                    //监听提交
                    form.on('submit(register-form-submit)', function (datas) {
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

    exports('tenant', {})
});