/**
 @Name：班级相册
 */
layui.define(['table', 'form', 'common', 'setter', 'element', 'laydate', 'laypage', 'laytpl', 'upload', 'verification'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , form = layui.form
        , laydate = layui.laydate
        , laypage = layui.laypage
        , laytpl = layui.laytpl
        , upload = layui.upload
        , element = layui.element;

    form.render("select");

    table.render({
        elem: '#classphotoalbum-table'
        , url: setter.apiAddress.classphotoalbum.pagelist
        , toolbar: '#classphotoalbum-toolbar'
        , cols: [[
            { field: 'name', title: '相册名称', align: 'left' },
            {
                field: 'coverPhoto', title: '封面图片', align: 'center',
                templet: function (d) {
                    return '<img src="' + layui.setter.base + d.coverPhoto + '" />';
                }
            },
            {
                field: 'visibleRange', title: '可见范围', align: 'center',
                templet: function (d) {
                    if (d.visibleRange == 1) {
                        return '<span style="color:#009688;">仅机构可见</span>';
                    } else if (d.visibleRange == 2) {
                        return '<span style="color:#1E9FFF;">机构学生可见</span>';
                    } else if (d.visibleRange == 3) {
                        return '<span style="color:#FF5722;">完全公开</span>';
                    } else {
                        return '<span style="color:#FFB800;">/</span>';
                    }
                }
            },
            { field: 'describe', title: '描述', align: 'left' },
            { field: 'createTime', width: 200, title: '创建时间', align: 'center' },
            {
                width: 150, title: '操作', align: 'center'
                , templet: function (d) {
                    var htmlButton = new Array();
                    htmlButton.push('<div class="layui-btn-group">')
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="edit"><i class="layui-icon layui-icon-edit"></i>编辑</a>');
                    htmlButton.push('<a class="layui-btn layui-btn-normal layui-btn-xs" lay-event="photos"><i class="layui-icon layui-icon-picture"></i>管理</a>');
                    htmlButton.push('</div>')
                    return htmlButton.join('');
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

    //头工具栏事件
    table.on('toolbar(classphotoalbum-table)', function (obj) {
        switch (obj.event) {
            case 'search':
                admin.popupRight({
                    title: '搜索相册'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('mschool/classphotoalbum/search').done(function () {
                            //初始化班级
                            admin.req({
                                url: setter.apiAddress.classes.list
                                , data: { isActive: true }
                                , done: function (res) {
                                    $("#sel-classes-list").append("<option value=\"\">请选择</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-classes-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //日期范围
                            laydate.render({
                                elem: '#daterange'
                                , range: true
                                , done: function (value, date, endDate) {
                                    if (!value) {
                                        $("#statr-time").val(' ');
                                        $("#end-time").val(' ');
                                    } else {
                                        $("#statr-time").val(date.year + "-" + date.month + "-" + date.date);
                                        $("#end-time").val(endDate.year + "-" + endDate.month + "-" + endDate.date);
                                    }
                                }
                            });
                            form.render();
                            //监听提交
                            form.on('submit(classphotoalbum-search-form-submit)', function (data) {
                                var field = data.field;
                                //执行重载
                                table.reload('classphotoalbum-table', {
                                    where: {
                                        classId: field.ClassId,
                                        visibleRange: field.VisibleRange,
                                        startDate: field.StartTime,
                                        endTime: field.EndTime
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
                admin.popupRight({
                    title: '创建相册'
                    , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                    , resize: false
                    , closeBtn: 1
                    , success: function (layero, index) {
                        view(this.id).render('mschool/classphotoalbum/add').done(function () {
                            form.render();
                            //初始化班级
                            admin.req({
                                url: setter.apiAddress.classes.list
                                , data: { isActive: true }
                                , done: function (res) {
                                    $("#sel-classes-list").append("<option value=\"\">请选择</option>");
                                    $.each(res.data, function (index, item) {
                                        $("#sel-classes-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    });
                                    form.render("select");
                                }
                            });
                            //监听提交
                            form.on('submit(classphotoalbum-add-form-submit)', function (data) {
                                //data.field.OrganizationName = $('dl.layui-anim .layui-this').html();
                                admin.req({
                                    url: setter.apiAddress.classphotoalbum.add
                                    , data: data.field
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        table.reload('classphotoalbum-table');
                                    }
                                });
                            });
                        });
                    }
                });
                break;
        };
    });

    //编辑&相册管理
    table.on('tool(classphotoalbum-table)', function (obj) {
        var data = obj.data;
        if (obj.event === 'edit') {
            admin.popupRight({
                title: '编辑相册'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['30%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('mschool/classphotoalbum/edit', data).done(function () {
                        //初始化班级
                        admin.req({
                            url: setter.apiAddress.classes.list
                            , data: { isActive: true }
                            , done: function (res) {
                                $("#sel-classes-list").append("<option value=\"\">请选择</option>");
                                $.each(res.data, function (index, item) {
                                    if (data.classId == item.id) {
                                        $("#sel-classes-list").append("<option selected=\"selected\" value=\"" + item.id + "\">" + item.name + "</option>");
                                    } else {
                                        $("#sel-classes-list").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                                    }
                                });
                                form.render("select");
                            }
                        });

                        $("#sel-coverPhoto-list").val(data.coverPhoto);
                        $("#sel-visibleRange-list").val(data.visibleRange);

                        form.render();

                        //监听提交
                        form.on('submit(classphotoalbum-edit-form-submit)', function (data) {
                            admin.req({
                                url: setter.apiAddress.classphotoalbum.update
                                , data: data.field
                                , type: 'POST'
                                , done: function (res) {
                                    layer.close(index);
                                    table.reload('classphotoalbum-table');
                                }
                            });
                        });
                    });
                }
            });
        } else if (obj.event === 'photos') {//相片管理
            admin.popupRight({
                title: '【' + data.name + '】' + '管理相册'
                , area: admin.screen() < 2 ? ['100%', '100%'] : ['50%', '100%']
                , resize: false
                , closeBtn: 1
                , success: function (layero, index) {
                    view(this.id).render('mschool/classphotoalbum/photos', data).done(function () {
                        form.render();

                        //加载相册中的相片
                        var photos = {
                            page: 1,//设置首页页码
                            limit: 6,
                            limits: [6, 12, 18, 24, 30, 36, 42, 48, 54], //设置一页显示的条数
                            count: 0,//总条数
                            initPhotos: function () {
                                //初始化学生列表
                                admin.req({
                                    url: setter.apiAddress.classphotoalbumattachment.pagelist
                                    , data: {
                                        page: photos.page,
                                        limit: photos.limit,
                                        photoalbumId: data.id
                                    }
                                    , done: function (res) {
                                        photos.count = res.data.totalCount;
                                        var gettpl = photostemplate.innerHTML
                                            , view = document.getElementById('photos');
                                        laytpl(gettpl).render(res.data, function (html) {
                                            view.innerHTML = html;
                                        });
                                        //初始化动态元素，一些动态生成的元素如果不设置初始化，将不会有默认的动态效果
                                        element.render();
                                        photos.initLaypage();
                                    }
                                });
                            },
                            initLaypage: function () {
                                //学生列表分页控件
                                laypage.render({
                                    elem: 'photos-paging-controls'
                                    , count: photos.count //数据总数，从服务端得到
                                    , curr: photos.page
                                    , limit: photos.limit
                                    , limits: photos.limits   //每页条数设置
                                    , layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                                    , groups: 5 //连续显示分页数
                                    , skip: true
                                    , prev: '上一页'
                                    , next: '下一页'
                                    , first: '首页'
                                    , last: '尾页'
                                    , jump: function (obj, first) {
                                        photos.page = obj.curr;
                                        photos.limit = obj.limit;
                                        //首次不执行
                                        if (!first) {
                                            photos.initPhotos();  //加载数据
                                        }
                                    }
                                });
                            }
                        };
                        photos.initPhotos();

                        //初始化提交数据
                        var uploadresult = {
                            photoalbumId: data.id,
                            attachmentFileName: '',
                            attachmentFullUri: '',
                            describe: ''
                        };
                        //初始化拖拽上传
                        upload.render({
                            elem: '#uploadimagecontrols'
                            , url: setter.apiAddress.filemanagement.tencentcosupload //上传接口
                            , accept: 'file'
                            , size: 2048 //限制文件大小，单位 KB
                            , exts: 'jpg|png'
                            , headers: { Authorization: "Bearer " + layui.data(setter.tableName)[setter.request.tokenName] }
                            , before: function (obj) {
                                //预读本地文件示例，不支持ie8
                                obj.preview(function (index, file, result) {
                                    //$('#preview').attr('src', result); //图片链接（base64）
                                });
                            }
                            , done: function (res) {
                                //$('#preview').hide();
                                layer.msg('上传成功', { icon: 6 });
                                layui.$('#uploaddoneview').removeClass('layui-hide').find('img').attr('src', res.data.uploadedUri);
                                uploadresult.attachmentFileName = res.data.fileName;
                                uploadresult.attachmentFullUri = res.data.uploadedUri;
                            }
                            , error: function (res) {
                                layer.msg("上传失败");
                            }
                        });
                        form.on('submit(classphotoalbum-upload-form-submit)', function (data) {
                            uploadresult.describe = data.field.Describe;
                            if (uploadresult.attachmentFileName.length <= 0 || uploadresult.attachmentFullUri.length <= 0) {
                                layer.msg("你没有上传任何图片", { icon: 5 });
                                return;
                            }
                            admin.req({
                                url: setter.apiAddress.classphotoalbumattachment.add
                                , data: uploadresult
                                , type: 'POST'
                                , done: function (res) {
                                    photos.initPhotos();
                                    $("#classphotoalbum-upload-form")[0].reset();
                                    uploadresult.attachmentFileName = '';
                                    uploadresult.attachmentFullUri = '';
                                    layui.$('#uploaddoneview').addClass('layui-hide').find('img').attr('src', '');
                                    layui.form.render();
                                    element.tabChange('classphotoalbum-table-filter', '0');
                                }
                            });
                        });
                        //监听删除事件//TODO:是否同时删除云上的图片资源
                        $(document).on('click', '.layui-icon-delete', function () {
                            let photoId = $(this).context.dataset.photo;
                            layer.confirm('删除后不可恢复，确定？', { icon: 3 }, function (index) {
                                admin.req({
                                    url: setter.apiAddress.classphotoalbumattachment.delete
                                    , data: { Id: photoId }
                                    , type: 'POST'
                                    , done: function (res) {
                                        layer.close(index);
                                        photos.initPhotos();
                                    }
                                });
                            });
                        });
                    });
                }
            });
        }
    });

    exports('classphotoalbum', {})
});