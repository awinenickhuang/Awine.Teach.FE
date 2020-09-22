/**
 @Name：学生管理
 */
layui.define(['table', 'form', 'setter', 'verification', 'laytpl', 'laypage'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , table = layui.table
        , setter = layui.setter
        , form = layui.form
        , laytpl = layui.laytpl
        , laypage = layui.laypage;
    form.render(null, 'student-search-form');
    //搜索 -> 初始课程数据
    admin.req({
        url: setter.apiAddress.course.list
        , data: {}
        , done: function (res) {
            $("#sel-course-search").append("<option value=\"\">请选择课程</option>");
            $.each(res.data, function (index, item) {
                $("#sel-course-search").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
            });
            form.render("select");
        }
    });

    form.on('select(course-search-filter)', function (data) {
        //搜索 -> 初始班级数据
        $("#sel-class-search").empty();
        admin.req({
            url: setter.apiAddress.classes.list
            , data: { courseId: data.value }
            , type: 'POST'
            , done: function (res) {
                $("#sel-class-search").append("<option value=\"\">请选择班级</option>");
                $.each(res.data, function (index, item) {
                    $("#sel-class-search").append("<option value=\"" + item.id + "\">" + item.name + "</option>");
                });
                form.render("select");
            }
        });
    });

    //搜索
    form.on('submit(student-search)', function (data) {
        var field = data.field;
        let conditions = {
            name: $("#name").val(),
            courseId: $("#sel-course-search").val(),
            classId: $("#sel-class-search").val(),
            phoneNumber: $("#phoneNumber").val(),
            status: $("#sel-status-search").val(),
            arrearage: 0,
            expire: 0
        };
        let otherconditions = $("#sel-otherconditions-search").val();
        if (otherconditions == 1) {
            conditions.arrearage = 1;
        }
        if (otherconditions == 2) {
            conditions.expire = 1;
        }
        //执行重载
        table.reload('student-table', {
            where: conditions,
            page: {
                curr: 1 //重新从第 1 页开始
            }
        });
    });

    var students = {
        page: 1,//设置首页页码
        limit: 6,
        limits: [6, 12, 18, 24, 30, 36, 42, 48, 54], //设置一页显示的条数
        count: 0,//总条数
        initStudents: function () {
            //初始化学生列表
            admin.req({
                url: setter.apiAddress.student.pagelist
                , data: {
                    page: students.page,
                    limit: students.limit
                }
                , done: function (res) {
                    students.count = res.data.totalCount;
                    var gettpl = studenttemplate.innerHTML
                        , view = document.getElementById('students');
                    laytpl(gettpl).render(res.data, function (html) {
                        view.innerHTML = html;
                    });
                    students.initLaypage();
                }
            });
        },
        initLaypage: function () {
            //学生列表分页控件
            laypage.render({
                elem: 'students-paging-controls'
                , count: students.count //数据总数，从服务端得到
                , curr: students.page
                , limit: students.limit
                , limits: students.limits   //每页条数设置
                , layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip']
                , groups: 5 //连续显示分页数
                , skip: true
                , prev: '上一页'
                , next: '下一页'
                , first: '首页'
                , last: '尾页'
                , jump: function (obj, first) {
                    students.page = obj.curr;
                    students.limit = obj.limit;
                    //首次不执行
                    if (!first) {
                        students.initStudents();  //加载数据
                    }
                }
            });
        }
    };
    students.initStudents();

    exports('student', {})
});