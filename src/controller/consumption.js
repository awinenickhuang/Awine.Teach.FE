/**
 @Name：课消记录
 */
layui.define(['table', 'form', 'common', 'setter', 'element', 'verification'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , table = layui.table
        , common = layui.common
        , setter = layui.setter
        , form = layui.form
        , element = layui.element;
    table.render({
        elem: '#consumption-table'
        , url: setter.apiAddress.studentattendance.pagelist
        , toolbar: '#consumption-toolbar'
        , where: {
            attendanceStatus: 1
        }
        , cols: [[
            { type: 'checkbox' },
            { field: 'studentName', title: '学生姓名' },
            { field: 'courseName', title: '课程名称' },
            { field: 'className', title: '班级名称' },
            {
                field: 'scheduleIdentification', title: '课节类型', align: 'center', width: 100,
                templet: function (d) {
                    switch (d.scheduleIdentification) {
                        case 1:
                            return '<span style="color:#009688;">正常课节</span>';
                            break;
                        case 2:
                            return '<span style="color:#FF5722;">试听课节</span>';
                            break;
                        case 3:
                            return '<span style="color:#FF5722;">补课课节</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            {
                field: 'attendanceStatus', title: '考勤状态', align: 'center', width: 100,
                templet: function (d) {
                    switch (d.attendanceStatus) {
                        case 1:
                            return '<span style="color:#009688;">出勤</span>';
                            break;
                        case 2:
                            return '<span style="color:#FF5722;">缺勤</span>';
                            break;
                        case 3:
                            return '<span style="color:#FFB800;">请假</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            {
                field: 'recordStatus', title: '数据标识', align: 'center', width: 100,
                templet: function (d) {
                    switch (d.recordStatus) {
                        case 1:
                            return '<span style="color:#009688;">正常</span>';
                            break;
                        case 2:
                            return '<span style="color:#FF5722;">取消</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            { field: 'consumedQuantity', width: 100, align: 'center', title: '扣减课时' },
            { field: 'createTime', width: 200, align: 'center', title: '创建时间' }
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

    exports('consumption', {})
});