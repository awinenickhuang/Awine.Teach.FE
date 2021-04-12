/**
 @Name���û�����
 */
layui.define(['table', 'form', 'setter', 'verification'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , setter = layui.setter
        , form = layui.form;
    //�����û�����
    table.render({
        elem: '#userprofile-table'
        , url: setter.apiAddress.aspnetuser.pagelist
        , toolbar: '#userprofile-toolbar'
        , cols: [[
            { field: 'userName', title: '����', align: 'left' },
            { field: 'account', title: '�˺�', align: 'left' },
            { field: 'tenantName', title: '����', align: 'left' },
            { field: 'departmentName', title: '����', align: 'left' },
            { field: 'aspnetRoleName', title: '��ɫ', align: 'left' },
            { field: 'phoneNumber', title: '�绰', align: 'left' },
            {
                field: 'lockoutEnabled', title: '�ɷ�����', align: 'center',
                templet: function (d) {
                    if (d.lockoutEnabled) {
                        return '<span style="color:#009688;">��</span>';
                    }
                    else {
                        return '<span style="color:#FF5722;">��</span>';
                    }
                }
            },
            {
                field: 'isActive', title: '�û�״̬', align: 'center',
                templet: function (d) {
                    if (d.lockoutEnabled) {
                        if (d.isActive) {
                            return '<input type="checkbox" name="isActive" lay-skin="switch" checked="" lay-text="����|ͣ��" value= ' + d.id + ' lay-filter="user-active-switch" >';
                        } else {
                            return '<input type="checkbox" name="isActive" lay-skin="switch" lay-text="����|ͣ��" value= ' + d.id + ' lay-filter="user-active-switch" >';
                        }
                    }
                    else {
                        if (d.isActive) {
                            return '<input type="checkbox" disabled="disabled" name="isActive" lay-skin="switch" checked="" lay-text="����|ͣ��" value= ' + d.id + ' lay-filter="" >';
                        } else {
                            return '<input type="checkbox" disabled="disabled" name="isActive" lay-skin="switch" lay-text="����|ͣ��" value= ' + d.id + ' lay-filter="" >';
                        }
                    }
                }
            },
            { field: 'createTime', width: 200, title: '����ʱ��', align: 'center' },
            {
                width: 160, title: '����', align: 'center'
                , templet: function (d) {
                    var htmlButton = new Array();
                    htmlButton.push('<div class="layui-btn-group">')
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="edit"><i class="layui-icon layui-icon-edit"></i>�༭</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="resetpassword"><i class="layui-icon layui-icon-password"></i>��������</a>');
                    htmlButton.push('</div>')
                    return htmlButton.join('');
                }
            }
        ]]
        , page: true
        , cellMinWidth: 80
        , height: 'full-160'
        , text: {
            none: '�����������'
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

    //��������״̬����
    form.on('switch(user-active-switch)', function (data) {
        var checked = data.elem.checked;
        //�õ��������DOM���� data.othis
        var message = 'ȷ��' + (checked ? '����' : '����') + '��?';
        data.elem.checked = !check;
        form.render();

        admin.req({
            url: setter.apiAddress.aspnetuser.enableordisable
            , data: { Id: data.value, isActive: checked }
            , type: 'POST'
            , done: function (res) {
                if (res.statusCode == 200) {
                    if (checked) {
                        data.elem.checked = checked;
                        layer.tips('��ʾ�����óɹ�', data.othis, { tips: [2, '#FFB800'] });
                    } else {
                        layer.tips('��ʾ�����óɹ�', data.othis, { tips: [2, '#FFB800'] });
                    }
                    layui.table.reload('userprofile-table');
                } else {
                    var em = $(data.othis[0]);
                    data.othis[0].classList.remove('layui-form-onswitch');
                    em.children('em').checked = checked;
                }
                form.render();
            }
        });
    });

    //ͷ�������¼�
    table.on('toolbar(userprofile-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'search':
                admin.popupRight({
                    title: '����'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('foundational/aspnetuser/search').done(function () {
                            //����
                            admin.req({
                                url: setter.apiAddress.tenant.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-organization-list").empty();
                                    $("#sel-organization-list").append("<option value=\"\">��ѡ�����</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-organization-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            form.on('select(organization-list-filter)', function (data) {
                                //����
                                $("#sel-department-list").empty();
                                admin.req({
                                    url: setter.apiAddress.department.list
                                    , data: { tenantId: data.tenantId }
                                    , done: function (res) {
                                        $("#sel-department-list").append("<option value=\"\">��ѡ����</option>");
                                        $.each(res.data, function (index, item) {
                                            $("#sel-department-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                        });
                                        form.render("select");
                                    }
                                });
                                //��ɫ
                                $("#sel-aspnetrole-list").empty();
                                admin.req({
                                    url: setter.apiAddress.awinerole.list
                                    , data: { tenantId: data.value }
                                    , done: function (res) {
                                        $("#sel-aspnetrole-list").append("<option value=\"\">��ѡ���ɫ</option>");
                                        $.each(res.data, function (index, item) {
                                            $("#sel-aspnetrole-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                        });
                                        form.render("select");
                                    }
                                });
                            });
                            //�����ύ//����
                            form.on('submit(aspnetuser-search-submit)', function (data) {
                                var field = data.field;
                                layer.close(index);
                                //ִ������
                                table.reload('userprofile-table', {
                                    where: {
                                        userName: field.name,
                                        tenantId: field.organizationId,
                                        departmentId: field.departmentId,
                                        roleId: field.roleId
                                    },
                                    page: {
                                        curr: 1 //���´ӵ� 1 ҳ��ʼ
                                    }
                                });
                            });
                        });
                    }
                });
                break;
            case 'add':
                admin.popupRight({
                    title: '���'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('foundational/aspnetuser/add').done(function () {
                            form.render();
                            $("#sel-aspnetRole-list").append("<option value=\"\">��ѡ���ɫ</option>");
                            $("#sel-department-list").append("<option value=\"\">��ѡ����</option>");
                            admin.req({
                                url: setter.apiAddress.tenant.list
                                , data: {}
                                , done: function (res) {
                                    $("#sel-organization-list").append("<option value=\"\">��ѡ�����</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-organization-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //����ѡ����ؽ�ɫ������
                            form.on('select(organization-add-filter)', function (data) {
                                $("#sel-aspnetRole-list").empty();
                                admin.req({
                                    url: setter.apiAddress.awinerole.list
                                    , data: { tenantId: data.value }
                                    , done: function (res) {
                                        $("#sel-aspnetRole-list").append("<option value=\"\">��ѡ���ɫ</option>");
                                        $.each(res.data, function (index, item) {
                                            $("#sel-aspnetRole-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                        });
                                        form.render("select");
                                    }
                                });
                                $("#sel-department-list").empty();
                                admin.req({
                                    url: setter.apiAddress.department.list
                                    , data: { tenantId: data.value }
                                    , done: function (res) {
                                        $("#sel-department-list").append("<option value=\"\">��ѡ����</option>");
                                        $.each(res.data, function (index, item) {
                                            $("#sel-department-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                        });
                                        form.render("select");
                                    }
                                });
                            });
                            //�����ύ
                            form.on('submit(userprofile-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.aspnetuser.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('userprofile-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    //�༭&�޸�״̬
    table.on('tool(userprofile-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'edit') {
            admin.popupRight({
                title: '�༭'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('foundational/aspnetuser/edit', data).done(function () {
                        form.render();
                        //��ʼ��������
                        admin.req({
                            url: setter.apiAddress.tenant.list
                            , data: {}
                            , done: function (res) {
                                $("#sel-organization-edit").append("<option value=\"\">��ѡ�����</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.tenantId == item.id) {
                                        $("#sel-organization-edit").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-organization-edit").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            }
                        });
                        //��ʼ����ɫ
                        admin.req({
                            url: setter.apiAddress.awinerole.list
                            , data: { tenantId: data.tenantId }
                            , done: function (res) {
                                $("#sel-aspnetrole-edit").append("<option value=\"\">��ѡ���ɫ</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.roleId == item.id) {
                                        $("#sel-aspnetrole-edit").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-aspnetrole-edit").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            }
                        });
                        //��ʼ������
                        admin.req({
                            url: setter.apiAddress.department.list
                            , data: { tenantId: data.tenantId }
                            , done: function (res) {
                                $("#sel-department-edit").append("<option value=\"\">��ѡ����</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.departmentId == item.id) {
                                        $("#sel-department-edit").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-department-edit").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            }
                        });

                        $('#sel-gender-edit').val(data.gender);

                        //��ɫ������Ӧ���������¼�
                        form.on('select(sel-organization-edit-filter)', function (data) {
                            $("#sel-aspnetrole-edit").empty();
                            admin.req({
                                url: setter.apiAddress.awinerole.list
                                , data: { tenantId: data.value }
                                , done: function (res) {
                                    $("#sel-aspnetrole-edit").append("<option value=\"\">��ѡ���ɫ</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-aspnetrole-edit").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                        });

                        //�����ύ
                        form.on('submit(userprofile-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.aspnetuser.update
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    table.reload('userprofile-table');
                                }
                            });
                        });
                    });
                }
            });
        } else if (obj.event === 'resetpassword') {
            admin.popupRight({
                title: '��������'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('foundational/aspnetuser/resetpassword', data).done(function () {
                        form.render();
                        form.on('submit(user-reset-password-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.aspnetuser.resetpassword
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    layer.msg(res.msg);
                                }
                            });
                        });
                    });
                }
            });
        }
    });

    exports('aspnetuser', {})
});