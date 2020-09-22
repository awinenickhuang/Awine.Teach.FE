/**
 @Name：反馈信息
 */
layui.define(['table', 'setter', 'verification'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , table = layui.table
        , setter = layui.setter;
    table.render({
        elem: '#feedback-table'
        , url: setter.apiAddress.feedback.pagelist
        , toolbar: '#feedback-toolbar'
        , cols: [[
            { field: 'feedbackMessage', title: '用户反馈信息' },
            {
                field: 'publicDisplay', title: '公开显示', align: 'center', width: 100,
                templet: function (d) {
                    switch (d.publicDisplay) {
                        case true:
                            return '<span style="color:#FFB800;">是</span>';
                            break;
                        case false:
                            return '<span style="color:#2F4056;">否</span>';
                            break;
                        default:
                            return '-';
                            break;
                    }
                }
            },
            { field: 'createTime', width: 200, align: 'center', title: '创建时间' }
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

    exports('feedback', {})
});