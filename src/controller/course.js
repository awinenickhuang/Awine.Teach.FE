/**
 @Name：课程管理
 */
layui.define(['table', 'form', 'layedit', 'setter', 'verification'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , setter = layui.setter
        , form = layui.form
        , layedit = layui.layedit;
    //定义富文本上传文件的接口地址
    layedit.set({
        uploadImage: {
            url: setter.apiAddress.filemanagement.singlefileupload
            , type: 'post'
        }
    });
    table.render({
        elem: '#course-table'
        , url: setter.apiAddress.course.pagelist
        , toolbar: '#course-toolbar'
        , cols: [[
            { field: 'name', title: '课程名称' },
            { field: 'teacherName', title: '课程名师', width: 150, align: 'center' },
            { field: 'displayOrder', title: '显示顺序', align: 'center', width: 100 },
            {
                field: 'enabledStatus', title: '课程状态', align: 'center', width: 100,
                templet: function (d) {
                    switch (d.enabledStatus) {
                        case 1:
                            return '<input type="checkbox" name="enabledStatus" lay-skin="switch" checked="" lay-text="启用|停用" value= ' + d.id + ' lay-filter="course-enabled-status" >';
                            break;
                        case 2:
                            return '<input type="checkbox" name="enabledStatus" lay-skin="switch" lay-text="启用|停用" value= ' + d.id + ' lay-filter="course-enabled-status" >';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            {
                width: 220, title: '操作', align: 'center'
                , templet: function (d) {
                    var htmlButton = new Array();
                    htmlButton.push('<div class="layui-btn-group">')
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="edit"><i class="layui-icon layui-icon-edit"></i>编辑</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-xs" lay-event="chargemanner"><i class="layui-icon layui-icon-rmb"></i>定价标准</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del"><i class="layui-icon layui-icon-delete"></i>删除</a>');
                    htmlButton.push('</div>')
                    return htmlButton.join('');
                }
            }
        ]]
        , page: true
        , cellMinWidth: 80
        , height: 'full-160'
        , text: {
            none: '暂无课程数据'
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

    //监听课程启用状态开关
    form.on('switch(course-enabled-status)', function (data) {
        var enabledStatus = this.checked ? 1 : 2;
        if (enabledStatus == 1) {
            layer.tips('提示：学生可以报读此课程', data.othis, { tips: [2, '#FFB800'] })
        }
        if (enabledStatus == 2) {
            layer.tips('提示：学生不可以报读此课程', data.othis, { tips: [2, '#FFB800'] })
        }
        admin.req({
            url: setter.apiAddress.course.updateenablestatus
            , data: { Id: data.value, enabledStatus: enabledStatus }
            , type: 'POST'
            , done: function (res) {
                table.reload('course-table');
            }
        });
    });

    //头工具栏事件
    table.on('toolbar(course-table)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        var selected = checkStatus.data;
        switch (obj.event) {
            case 'add':
                admin.popupRight({
                    title: '添加'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('teaching/course/add').done(function () {
                            form.render();
                            //初始化老师
                            admin.req({
                                url: setter.apiAddress.aspnetuser.list
                                , data: { enableStatus: 1 }
                                , done: function (res) {
                                    $("#sel-teacher-list").append("<option value=\"\">请选择</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-teacher-list").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            form.on('select(sel-teacher-list-filter)', function (data) {
                                $("#hiddenTeacherName").val(data.elem[data.elem.selectedIndex].text);
                            });
                            //创建富文本编辑器
                            var LAY_IntroductionIndex = layedit.build('LAY_CourseIntroduction', {
                                tool: [
                                    'strong' //加粗
                                    , 'italic' //斜体
                                    , 'underline' //下划线
                                    , 'del' //删除线
                                    , '|' //分割线
                                    , 'left' //左对齐
                                    , 'center' //居中对齐
                                    , 'right' //右对齐
                                    //, 'link' //超链接
                                    //, 'unlink' //清除链接
                                    , 'face' //表情
                                ],
                                height: 300
                            });
                            //1-进行重新渲染表单
                            form.render(null, 'component-form-element');  //component-form-element 是form表单和提交按钮中 lay-filter中的值
                            //2-进行验证 同步一下
                            form.verify({
                                course_introduction_verify: function (value) {
                                    layedit.sync(LAY_IntroductionIndex);
                                }
                            });
                            //监听提交
                            form.on('submit(course-add-form-submit)', function (data) {
                                admin.req({
                                    url: setter.apiAddress.course.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('course-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    table.on('tool(course-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'del') {
            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                admin.req({
                    url: setter.apiAddress.course.delete
                    , data: { Id: data.id }
                    , type: 'POST'
                    , done: function (res) {
                        layer.close(index);
                        table.reload('course-table');
                    }
                });
            });
        } else if (obj.event === 'edit') {
            admin.popupRight({
                title: '修改'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('teaching/course/edit', data).done(function () {
                        form.render();
                        //初始化老师
                        admin.req({
                            url: setter.apiAddress.aspnetuser.list
                            , data: { enableStatus: 1 }
                            , done: function (res) {
                                $("#sel-teacher-list").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.teacherId == item.id) {
                                        $("#sel-teacher-edit").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.userName + "</option>");
                                    } else {
                                        $("#sel-teacher-edit").append("<option value=\"" + item.id + "\">" + item.userName + "</option>");
                                    }
                                });
                                form.render("select");
                            }
                        });
                        form.on('select(sel-teacher-edit-filter)', function (data) {
                            $("#hiddenEditTeacherName").val(data.elem[data.elem.selectedIndex].text);
                        });
                        //创建富文本编辑器
                        var LAY_IntroductionIndex = layedit.build('LAY_CourseIntroduction', {
                            tool: [
                                'strong' //加粗
                                , 'italic' //斜体
                                , 'underline' //下划线
                                , 'del' //删除线
                                , '|' //分割线
                                , 'left' //左对齐
                                , 'center' //居中对齐
                                , 'right' //右对齐
                                //, 'link' //超链接
                                //, 'unlink' //清除链接
                                , 'face' //表情
                            ],
                            height: 300
                        });
                        //1-进行重新渲染表单
                        form.render(null, 'component-form-element');  //component-form-element 是form表单和提交按钮中 lay-filter中的值
                        //2-进行验证 同步一下
                        form.verify({
                            course_introduction_verify: function (value) {
                                layedit.sync(LAY_IntroductionIndex);
                            }
                        });
                        //初始化课程状态
                        $('#sel-enabled-status-edit').val(data.enabledStatus);
                        form.on('submit(course-edit-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.course.update
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    table.reload('course-table');
                                }
                            });
                        });
                    });
                }
            });
        } else if (obj.event === 'chargemanner') {
            admin.popupRight({
                title: '定价标准'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['35%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('teaching/course/chargemanner', data).done(function () {
                        form.render();
                        //初始化课程收费方式列表
                        table.render({
                            elem: '#course-chargemanner-table'
                            , url: setter.apiAddress.coursechargemanner.pagelist
                            , where: {
                                courseId: data.id,
                            }
                            , cols: [[
                                {
                                    field: 'chargeManner', title: '收费方式', align: 'center',
                                    templet: function (d) {
                                        switch (d.chargeManner) {
                                            case 1:
                                                return '<span style="color:#009688;">按课时收费</span>';
                                                break;
                                            case 2:
                                                return '<span style="color:#009688;">按月收费</span>';
                                                break;
                                            default:
                                                return '-';
                                                break;
                                        }
                                    }
                                },
                                {
                                    field: 'chargeManner', title: '数量', align: 'center',
                                    templet: function (d) {
                                        switch (d.chargeManner) {
                                            case 1:
                                                return '<span style="color:#009688;">' + d.courseDuration + '（课时）</span>';
                                                break;
                                            case 2:
                                                return '<span style="color:#009688;">' + d.courseDuration + '（月）</span>';
                                                break;
                                            default:
                                                return '-';
                                                break;
                                        }
                                    }
                                },
                                { field: 'totalPrice', title: '总价（元）', align: 'center' },
                                {
                                    field: 'chargeManner', title: '单价', align: 'center',
                                    templet: function (d) {
                                        switch (d.chargeManner) {
                                            case 1:
                                                return '<span style="color:#009688;">' + d.chargeUnitPriceClassHour + '（元/课时）</span>';
                                                break;
                                            case 2:
                                                return '<span style="color:#009688;">' + d.chargeUnitPriceMonth + '（元/月）</span>';
                                                break;
                                            default:
                                                return '-';
                                                break;
                                        }
                                    }
                                },
                                {
                                    width: 100, title: '操作', align: 'center'
                                    , templet: function (d) {
                                        var htmlButton = new Array();
                                        htmlButton.push('<div class="layui-btn-group">')
                                        htmlButton.push('<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del"><i class="layui-icon layui-icon-delete"></i>删除</a>');
                                        htmlButton.push('</div>')
                                        return htmlButton.join('');
                                    }
                                }
                            ]]
                            , page: true
                            , cellMinWidth: 80
                            , text: {
                                none: '暂无课程数据'
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
                        table.on('tool(course-chargemanner-table)', function (obj) {
                            var data = obj.data;
                            if (obj.event === 'del') {
                                layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                                    admin.req({
                                        url: setter.apiAddress.coursechargemanner.delete
                                        , data: { Id: data.id }
                                        , type: 'POST'
                                        , done: function (res) {
                                            layer.close(index);
                                            table.reload('course-chargemanner-table');
                                        }
                                    });
                                });
                            }
                        });
                        //监听收费方式下拉选择事件
                        form.on('select(sel-charge-manner-list-filter)', function (seldata) {
                            if (seldata.value == 1) {
                                $("#charge-unitprice-classhour").show();
                                $("#charge-unitprice-month").hide();
                                $('#courseDuration').val(1);
                                $('#chargeUnitPriceMonth').val('');
                                $('#totalPrice').val('');
                            }
                            if (seldata.value == 2) {
                                $("#charge-unitprice-month").show();
                                $("#charge-unitprice-classhour").hide();
                                $('#courseDuration').val(1);
                                $('#chargeUnitPriceClassHour').val('');
                                $('#totalPrice').val('');
                            }
                        });
                        //数量输入限制
                        $('#courseDuration').bind('input onkeyup', function () {
                            var courseDuration = $('#courseDuration').val();
                            if (!new RegExp("^[1-9]([0-9])*$").test(courseDuration)) {
                                $('#courseDuration').val('');
                                return;
                            }
                            var totalPrice = $('#totalPrice').val();
                            var unitPrice = (totalPrice / courseDuration).toFixed(2);
                            if ($("#sel-charge-manner-list").val() == 1) {
                                $('#chargeUnitPriceClassHour').val(unitPrice);
                            } else {
                                $('#chargeUnitPriceMonth').val(unitPrice);
                            }
                        }).bind("paste", function () {
                            $(this).val(0);
                        }).css("ime-mode", "disabled");
                        //课程总价输入限制
                        $('#totalPrice').bind('input onkeyup', function () {
                            var totalPrice = $('#totalPrice').val();
                            if (!new RegExp("^(([1-9]{1}\\d*)|([0]{1}))(\\.(\\d){0,2})?$").test(totalPrice)) {
                                $('#totalPrice').val('');
                                return;
                            }
                            var courseDuration = $('#courseDuration').val();
                            var unitPrice = (totalPrice / courseDuration).toFixed(2);
                            if ($("#sel-charge-manner-list").val() == 1) {
                                $('#chargeUnitPriceClassHour').val(unitPrice);
                            } else {
                                $('#chargeUnitPriceMonth').val(unitPrice);
                            }
                        }).bind("paste", function () {
                            $(this).val(0);
                        }).css("ime-mode", "disabled");

                        if ($("#sel-charge-manner-list").val() == 1) {
                            $('#chargeUnitPriceMonth').val(0);
                        } else {
                            $('#chargeUnitPriceClassHour').val(0);
                        }
                        //监听提交
                        form.on('submit(chargemanner-add-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.coursechargemanner.add
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    table.reload('course-chargemanner-table');
                                }
                            });
                        });
                    });
                }
            });
        }
    });

    exports('course', {})
});