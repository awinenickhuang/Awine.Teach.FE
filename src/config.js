/**

 @Name：全局配置
    
 */

layui.define(['laytpl', 'layer', 'element', 'util'], function (exports) {
    var apiGatewayAddress = 'http://localhost:8000'
    exports('setter', {
        container: 'LAY_app' //容器ID
        , base: layui.cache.base //记录layuiAdmin文件夹所在路径
        , views: layui.cache.base + 'views/' //视图所在目录
        , entry: 'index' //默认视图文件名
        , engine: '.html' //视图文件后缀名
        , pageTabs: false //是否开启页面选项卡功能。单页版不推荐开启
        , name: '微恩云校 Awine campus'
        , tableName: 'layuiAdmin' //本地存储表名
        , MOD_NAME: 'admin' //模块事件名
        , debug: true //是否开启调试模式。如开启，接口异常时会抛出异常 URL 等信息
        , interceptor: true //是否开启未登入拦截

        //自定义请求字段
        , request: {
            tokenName: 'access_token' //自动携带 token 的字段名。可设置 false 不携带。
        }

        //自定义响应字段
        , response: {
            statusName: 'code' //数据状态的字段名称
            , statusCode: {
                ok: 0 //数据状态一切正常的状态码
                , logout: 1001 //登录状态失效的状态码
            }
            , msgName: 'msg' //状态信息的字段名称
            , dataName: 'data' //数据详情的字段名称
        }

        //独立页面路由，可随意添加（无需写参数）
        , indPage: [
            '/user/login' //登入页
            , '/user/reg' //注册页
            , '/user/forget' //找回密码
            , '/template/tips/test' //独立页的一个测试 demo
        ]

        //扩展的第三方模块
        , extend: [
            'echarts', //echarts 核心包
            'echartsTheme', //echarts 主题
            'fullCalendar'
        ]

        //主题配置
        , theme: {
            //内置主题配色方案
            color: [{
                main: '#20222A' //主题色
                , selected: '#009688' //选中色
                , alias: 'default' //默认别名
            }, {
                main: '#03152A'
                , selected: '#3B91FF'
                , alias: 'dark-blue' //藏蓝
            }, {
                main: '#2E241B'
                , selected: '#A48566'
                , alias: 'coffee' //咖啡
            }, {
                main: '#50314F'
                , selected: '#7A4D7B'
                , alias: 'purple-red' //紫红
            }, {
                main: '#344058'
                , logo: '#1E9FFF'
                , selected: '#1E9FFF'
                , alias: 'ocean' //海洋
            }, {
                main: '#3A3D49'
                , logo: '#2F9688'
                , selected: '#5FB878'
                , alias: 'green' //墨绿
            }, {
                main: '#20222A'
                , logo: '#F78400'
                , selected: '#F78400'
                , alias: 'red' //橙色
            }, {
                main: '#28333E'
                , logo: '#AA3130'
                , selected: '#AA3130'
                , alias: 'fashion-red' //时尚红
            }, {
                main: '#24262F'
                , logo: '#3A3D49'
                , selected: '#009688'
                , alias: 'classic-black' //经典黑
            }, {
                logo: '#226A62'
                , header: '#2F9688'
                , alias: 'green-header' //墨绿头
            }, {
                main: '#344058'
                , logo: '#0085E8'
                , selected: '#1E9FFF'
                , header: '#1E9FFF'
                , alias: 'ocean-header' //海洋头
            }, {
                header: '#393D49'
                , alias: 'classic-black-header' //经典黑
            }, {
                main: '#50314F'
                , logo: '#50314F'
                , selected: '#7A4D7B'
                , header: '#50314F'
                , alias: 'purple-red-header' //紫红头
            }, {
                main: '#28333E'
                , logo: '#28333E'
                , selected: '#AA3130'
                , header: '#AA3130'
                , alias: 'fashion-red-header' //时尚红头
            }, {
                main: '#28333E'
                , logo: '#009688'
                , selected: '#009688'
                , header: '#009688'
                , alias: 'green-header' //墨绿头
            }]

            //初始的颜色索引，对应上面的配色方案数组索引
            //如果本地已经有主题色记录，则以本地记录为优先，除非请求本地数据（localStorage）
            , initColorIndex: 0
        }
        , apiAddress: {
            filemanagement: {
                singlefileupload: 'http://localhost:9000/api/filemanagement/singlefileupload'
            },
            area: {
                getbyparentcode: 'http://localhost:8001/api/regionalism/subordinate',
            },
            awinemodule: {
                list: 'http://localhost:8001/api/modules/list',
                pagelist: 'http://localhost:8001/api/modules/pagelist',
                listwithchedkedstatus: 'http://localhost:8001/api/modules/listwithchedkedstatus',
                treelist: 'http://localhost:8001/api/modules/treelist',
                add: 'http://localhost:8001/api/modules/add',
                update: 'http://localhost:8001/api/modules/update',
                delete: 'http://localhost:8001/api/modules/delete',
                getroleownedmodules: 'http://localhost:8001/api/modules/getroleownedmodules',
            },
            awinebutton: {
                btnlist: 'http://localhost:8001/api/buttons/btnlist',
                list: 'http://localhost:8001/api/buttons/list',
                pagelist: 'http://localhost:8001/api/buttons/pagelist',
                add: 'http://localhost:8001/api/buttons/add',
                update: 'http://localhost:8001/api/buttons/update',
                delete: 'http://localhost:8001/api/buttons/delete',
            },
            awinerole: {
                list: 'http://localhost:8001/api/aspnetrole/list',
                pagelist: 'http://localhost:8001/api/aspnetrole/pagelist',
                add: 'http://localhost:8001/api/aspnetrole/add',
                update: 'http://localhost:8001/api/aspnetrole/update',
                delete: 'http://localhost:8001/api/aspnetrole/delete',
                saveroleownedmodules: 'http://localhost:8001/api/aspnetrole/saveroleownedmodules',
                getroleownedmodules: 'http://localhost:8001/api/aspnetrole/getroleownedmodules',
            },
            aspnetroleclaims: {
                list: 'http://localhost:8001/api/aspnetroleclaims/list'
            },
            aspnetuser: {
                list: 'http://localhost:8001/api/aspnetuser/list',
                pagelist: 'http://localhost:8001/api/aspnetuser/pagelist',
                add: 'http://localhost:8001/api/aspnetuser/add',
                update: 'http://localhost:8001/api/aspnetuser/update',
                resetpassword: 'http://localhost:8001/api/aspnetuser/resetpassword',
                updatepassword: 'http://localhost:8001/api/aspnetuser/updatepassword',
                enableordisable: 'http://localhost:8001/api/aspnetuser/enableordisable',
                allindepartment: 'http://localhost:8001/api/aspnetuser/allindepartment',
                details: 'http://localhost:8001/api/aspnetuser/details',
            },
            industry: {
                add: 'http://localhost:8001/api/industry/add',
                delete: 'http://localhost:8001/api/industry/delete',
                update: 'http://localhost:8001/api/industry/update',
                pagelist: 'http://localhost:8001/api/industry/pagelist',
                list: 'http://localhost:8001/api/industry/list',
            },
            tenant: {
                list: 'http://localhost:8001/api/platformtenant/list',
                pagelist: 'http://localhost:8001/api/platformtenant/pagelist',
                add: 'http://localhost:8001/api/platformtenant/add',
                update: 'http://localhost:8001/api/platformtenant/update',
                delete: 'http://localhost:8001/api/platformtenant/delete',
                updateclassfication: 'http://localhost:8001/api/platformtenant/updateclassfication',
                updatestatus: 'http://localhost:8001/api/platformtenant/updatestatus',
                updatenumberofbranches: 'http://localhost:8001/api/platformtenant/updatenumberofbranches'
            },
            department: {
                list: 'http://localhost:8001/api/department/list',
                pagelist: 'http://localhost:8001/api/department/pagelist',
                add: 'http://localhost:8001/api/department/add',
                delete: 'http://localhost:8001/api/department/delete',
                update: 'http://localhost:8001/api/department/update',
            },
            marketingchannel: {
                pagelist: 'http://localhost:8002/api/marketingchannel/pagelist',
                list: 'http://localhost:8002/api/marketingchannel/list',
                add: 'http://localhost:8002/api/marketingchannel/add',
                update: 'http://localhost:8002/api/marketingchannel/update',
            },
            consultrecord: {
                pagelist: 'http://localhost:8002/api/consultrecord/pagelist',
                add: 'http://localhost:8002/api/consultrecord/add',
                update: 'http://localhost:8002/api/consultrecord/update',
                trackingassigned: 'http://localhost:8002/api/consultrecord/trackingassigned',

            },
            communicationrecord: {
                pagelist: 'http://localhost:8002/api/communicationrecord/pagelist',
                add: 'http://localhost:8002/api/communicationrecord/add',
            },
            trialclass: {
                list: 'http://localhost:8002/api/trialclass/list',
                pagelist: 'http://localhost:8002/api/trialclass/pagelist',
                add: 'http://localhost:8002/api/trialclass/add',
                update: 'http://localhost:8002/api/trialclass/update',
                listenfollowclass: 'http://localhost:8002/api/trialclass/listenfollowclass',
                onetoonelisten: 'http://localhost:8002/api/trialclass/onetoonelisten',
                updatelisteningstate: 'http://localhost:8002/api/trialclass/updatelisteningstate',
                delete: 'http://localhost:8002/api/trialclass/delete'
            },
            holiday: {
                pagelist: 'http://localhost:8002/api/legalholiday/pagelist',
                list: 'http://localhost:8002/api/legalholiday/list',
                add: 'http://localhost:8002/api/legalholiday/add',
                update: 'http://localhost:8002/api/legalholiday/update',
                delete: 'http://localhost:8002/api/legalholiday/delete',
            },
            student: {
                pagelist: 'http://localhost:8002/api/student/pagelist',
                add: 'http://localhost:8002/api/student/add',
                update: 'http://localhost:8002/api/student/update',
                single: 'http://localhost:8002/api/student/single',
                registration: 'http://localhost:8002/api/student/registration',
                supplement: 'http://localhost:8002/api/student/supplement',
            },
            studentcourseitem: {
                list: 'http://localhost:8002/api/studentcourseitem/list',
                pagelist: 'http://localhost:8002/api/studentcourseitem/pagelist',
                addstudentsintoclass: 'http://localhost:8002/api/studentcourseitem/addstudentsintoclass',
                removestudentfromclass: 'http://localhost:8002/api/studentcourseitem/removestudentfromclass',
            },
            studentcourseorder: {
                list: 'http://localhost:8002/api/studentcourseorder/list',
            },
            studentattendance: {
                pagelist: 'http://localhost:8002/api/studentattendance/pagelist',
                add: 'http://localhost:8002/api/studentattendance/add',
                cancel: 'http://localhost:8002/api/studentattendance/cancel',
                attendance: 'http://localhost:8002/api/studentattendance/attendance'
            },
            course: {
                pagelist: 'http://localhost:8002/api/course/pagelist',
                list: 'http://localhost:8002/api/course/list',
                add: 'http://localhost:8002/api/course/add',
                update: 'http://localhost:8002/api/course/update',
                updateenablestatus: 'http://localhost:8002/api/course/updateenablestatus',
                delete: 'http://localhost:8002/api/course/delete',
            },
            coursechargemanner: {
                pagelist: 'http://localhost:8002/api/coursechargemanner/pagelist',
                list: 'http://localhost:8002/api/coursechargemanner/list',
                get: 'http://localhost:8002/api/coursechargemanner/get',
                add: 'http://localhost:8002/api/coursechargemanner/add',
                update: 'http://localhost:8002/api/coursechargemanner/update',
                delete: 'http://localhost:8002/api/coursechargemanner/delete',
            },
            classroom: {
                pagelist: 'http://localhost:8002/api/classroom/pagelist',
                list: 'http://localhost:8002/api/classroom/list',
                add: 'http://localhost:8002/api/classroom/add',
                update: 'http://localhost:8002/api/classroom/update',
                delete: 'http://localhost:8002/api/classroom/delete',
                getallwithconflictstate: 'http://localhost:8002/api/classroom/getallwithconflictstate'
            },
            classes: {
                pagelist: 'http://localhost:8002/api/classes/pagelist',
                list: 'http://localhost:8002/api/classes/list',
                add: 'http://localhost:8002/api/classes/add',
                update: 'http://localhost:8002/api/classes/update',
                delete: 'http://localhost:8002/api/classes/delete',
                updaterecruitstatus: 'http://localhost:8002/api/classes/updaterecruitstatus'
            },
            courseschedule: {
                getallwithconflictstate: 'http://localhost:8002/api/courseschedule/getallwithconflictstate',
                list: 'http://localhost:8002/api/courseschedule/list',
                listschedule: 'http://localhost:8002/api/courseschedule/listschedule',
                pagelist: 'http://localhost:8002/api/courseschedule/pagelist',
                addclassschedulingplan: 'http://localhost:8002/api/courseschedule/addclassschedulingplan',
                update: 'http://localhost:8002/api/courseschedule/update',
                delete: 'http://localhost:8002/api/courseschedule/delete',
            },
            paymentmethod: {
                pagelist: 'http://localhost:8002/api/paymentmethod/pagelist',
                list: 'http://localhost:8002/api/paymentmethod/list',
                add: 'http://localhost:8002/api/paymentmethod/add',
                update: 'http://localhost:8002/api/paymentmethod/update',
                delete: 'http://localhost:8002/api/paymentmethod/delete',
            },
            financialitems: {
                pagelist: 'http://localhost:8003/api/financialitem/pagelist',
                list: 'http://localhost:8003/api/financialitem/list',
                add: 'http://localhost:8003/api/financialitem/add',
                update: 'http://localhost:8003/api/financialitem/update',
                updatestatus: 'http://localhost:8003/api/financialitem/updatestatus',
                delete: 'http://localhost:8003/api/financialitem/delete',
            },
            dailyspending: {
                pagelist: 'http://localhost:8003/api/dailyspending/pagelist',
                add: 'http://localhost:8003/api/dailyspending/add',
                update: 'http://localhost:8003/api/dailyspending/update',
                delete: 'http://localhost:8003/api/dailyspending/delete',
            },
            announcements: {
                pagelist: 'http://localhost:8004/api/announcement/pagelist',
                single: 'http://localhost:8004/api/announcement/single',
                add: 'http://localhost:8004/api/announcement/add',
                delete: 'http://localhost:8004/api/announcement/delete',
            }
        }
    });
});
