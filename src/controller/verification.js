/*
 * 扩展验证规则---框架中已有验证规则，直接使用，不要重复添加
 * phone（手机号）
 * email（邮箱）
 * url（网址）
 * number（数字）
 * date（日期）
 * identity（身份证）
 * 
 * 验证必填项：lay-verify=”required”
 * 数字验证：lay-verify=”int”
 * 验证用户名：lay-verify=”username”
 * 验证手机号：lay-verify=”phone”
 * 验证邮箱：lay-verify=”email”
 * 验证身份证：lay-verify=”identity”
 * 验证日期：lay-verify=”date”
 * 验证链接：lay-verify=”url”
 * 自定义密码验证：lay-verify=”pass”
 * 
 */

layui.define(['form', 'common'], function (exports) {

    var $ = layui.$
        , form = layui.form
        , common = layui.common;

    form.verify({
        username: function (value, item) { //value：表单的值、item：表单的DOM对象
            if (!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(value)) {
                return '用户名不能有特殊字符';
            }
            if (/(^\_)|(\__)|(\_+$)/.test(value)) {
                return '用户名首尾不能出现下划线\'_\'';
            }
            if (/^\d+\d+\d$/.test(value)) {
                return '用户名不能全为数字';
            }
        }
        //我们既支持上述函数式的方式，也支持下述数组的形式
        //数组的两个值分别代表：[正则匹配、匹配不符时的提示文字]
        , password: [
            /^[\S]{6,12}$/
            , '密码必须6到12位，且不能出现空格'
        ]
        , name: [
            /^[\S]$/
            , '不能输入空格'
        ]
        , money: function (value, item) {
            if (!new RegExp("/[^\d\.]/g").test(value)) {
                return '只能输入数字、小数点';
            }
        }
        , chinese: function (value, item) {
            if (!new RegExp("/^[\u0391-\uFFE5]+$/").test(value)) {
                return '只能输入中文';
            }
        }
        , english: function (value, item) {
            if (!new RegExp("/^[a-zA-Z]*$/").test(value)) {
                return '只能输入大小写英文字母';
            }
        }, numenglish: function (value, item) {
            if (new RegExp("/^[0-9a-zA-Z]*$/g").test(value)) {
                return '只能输入数字或字母';
            }
        }
        , idcard: function (value, item) {
            if (!new RegExp("/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/").test(value)) {
                return '身份证号只能输入15位或18位数字和英文x';
            }
        }
        , nowdate: function (value, item) {
            var mydate = new Date();
            var str = "" + mydate.getFullYear() + "-";
            str += (mydate.getMonth() + 1) + "-";
            str += mydate.getDate() + "-";
            var end = new Date(str.replace("-", "/").replace("-", "/"));
            var start = new Date(value.replace("-", "/").replace("-", "/"));
            if (start > end) {
                return '所选日期大于当前时间';
            }
        }
        , versions: [
            /^\d+\.\d+\.\d+$/
            , '输入格式如：1.0.1或12.32.33'
        ]
        , nowyear: function (value, item) {
            var mydate = new Date();
            var str = "" + mydate.getFullYear();
            if (value > str) {
                return '所选年份大于当前年份';
            }
        }
        , nowdatetiem: function (value, item) {
            var d1 = new Date(value.replace(/\-/g, "\/"));
            var d2 = common.nowdate();
            var today = new Date(d2.replace(/-/g, "/"));
            if (d1 < today) {
                return '所选日期不能小于当前日期';
            }
        }
        , age: function (value, item) {
            if (parseInt(value) > parseInt($("#maxAge").val())) {
                return '最小年龄不能大于最大年龄';
            }
        }
        , positive: function (value, item) {
            if (parseInt(value) <= 0) {
                return '不允许输入小于等于零的数字';
            } else if (!new RegExp("^[0-9]*$").test(value)) {
                return '只能输入数字';
            }
        }
        , select: function (value, item) {
            if (value == "" || value == null || value == "-1") {
                return '必填项不能为空';
            }
        },
        isPhoneNumber: function (value, item) { //value：表单的值、item：表单的DOM对象           
            if (value != "") {
                var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
                if (!myreg.test(value)) {
                    return "请输入正确的手机号格式";
                }
            }
        }
        , idcardIstrue: function (value, item) {
            if (value != "") {
                var idcard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
                if (!idcard.test(value)) {
                    return '身份证号只能输入15位或18位数字和英文x';
                }
            }
        }, numenglishIstrue: function (value, item) {
            if (value != "") {
                var studentnumber = /^[0-9a-zA-Z]*$/;
                if (!studentnumber.test(value)) {
                    return '只能输入数字或字母';
                }
            }
        }, mainnumber: function (value, item) {
            var num = /^([1-9]\d?|99)$/;
            if (!num.test(value)) {
                return '只允许输入1-99的数字';
            }
        }
        //普通输入框长度验证
        , normallength: [
            /^[\S]{2,32}$/
            , '必须2到32位，且不能出现空格'
        ]
        //普通输入框长度验证
        , speciallength: [
            /^[\S]{1,30}$/
            , '必须1到30位，且不能出现空格'
        ]
        //小数最多只能保留两位
        , decimalplaces: [
            /^-?\d+(\.\d{1,2})?$/
            , '请输入正确的金额，且最多只能保留两位小数'
        ]
        //描述性输入框长度验证
        , describelength: [
            /^[\S]{0,100}$/
            , '必须2到100位，且不能出现空格'
        ], chineselength: [
            /^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5]{1,30}$/
            , '必须2到10位，只能输入汉字或汉字加数字'
        ], specialCharacters: function (value, item) {
            if (value != "") {
                var characters = /(^[a-zA-Z0-9\u4e00-\u9fa5]{2,50}$)/;
                if (!characters.test(value)) {
                    return '只能输入大小写字母、数字和汉字且只能有2-50个字符';
                }
            }
        }
    });
    //对外暴露的接口
    exports('verification', {});
});