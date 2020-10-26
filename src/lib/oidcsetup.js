layui.define(['table'], function (exports) {
    var $ = layui.$
        , admin = layui.admin
        , view = layui.view
        , setter = layui.setter
        , table = layui.table;

    //使用oidc-client库中的UserManager类来管理OpenID连接协议,添加此代码以配置和实例化UserManager.
    var config = {
        authority: "http://localhost:5000/",
        client_id: "9eda1e5372cf4b19a889140d3b960d88",
        redirect_uri: "http://localhost:8888/start/callback.html",
        post_logout_redirect_uri: "http://localhost:8888/start/index.html",

        // if we choose to use popup window instead for logins
        popup_redirect_uri: "http://localhost:8888/start/popup.html",
        popupWindowFeatures: "menubar=yes,location=yes,toolbar=yes,width=1200,height=800,left=100,top=100;resizable=yes",

        // these two will be done dynamically from the buttons clicked, but are
        // needed if you want to use the silent_renew
        response_type: "id_token token",
        //scope: "openid profile email api1 api2.read_only",
        scope: "openid profile file_management_service foundation_service teaching_affair_service financial_service operation_service",

        // this will toggle if profile endpoint is used
        loadUserInfo: false,

        //userStore: new WebStorageStateStore({ store: window.localStorage }),
        accessTokenExpiringNotificationTime: 4,
        // silentRequestTimeout:10000,

        // silent renew will get a new access_token via an iframe 
        // just prior to the old access_token expiring (60 seconds prior)
        //启用静默刷新token
        silent_redirect_uri: "http://localhost:8888/start/silent.html",
        automaticSilentRenew: true,

        // will revoke (reference) access tokens at logout time
        revokeAccessTokenOnSignout: true,

        // this will allow all the OIDC protocol claims to be visible in the window. normally a client app 
        // wouldn't care about them or want them taking up space
        filterProtocolClaims: false
    };

    Oidc.Log.logger = window.console;
    Oidc.Log.level = Oidc.Log.DEBUG;

    var mgr = new Oidc.UserManager(config);

    /*
     * UserManager提供一个getUser API来获取用户是否登录到JavaScript应用程序.
     * 返回的User对象有一个profile属性,其中包含用户的声明.
     * 添加此代码以检测用户是否登录到JavaScript应用程序
     */
    mgr.getUser().then(function (user) {
        if (user) {
            layui.data(setter.tableName, {
                key: 'tenantname'
                , value: user.profile.tenantname
            });
            layui.data(setter.tableName, {
                key: 'username'
                , value: user.profile.username
            });
            layui.data(setter.tableName, {
                key: setter.request.tokenName
                , value: user.access_token
            });
            table.set({ headers: { Authorization: "Bearer " + user.access_token } });
            console.log("log -> user logged in");
        }
        else {
            console.log("log -> user not logged in");
            mgr.signinRedirect();
        }
    });

    /*
     * 通过events.addUserLoaded 挂载userLoaded事件处理函数,
     * 把用户信息保存到全局的user对象中
     * 这个对象有: id_token,access_token,scope和profile等属性,这些属性包含各种用户具体的数据
     */
    mgr.events.addUserLoaded(function (user) {
        layui.data(setter.tableName, {
            key: 'tenantname'
            , value: user.profile.tenantname
        });
        layui.data(setter.tableName, {
            key: 'username'
            , value: user.profile.username
        });
        layui.data(setter.tableName, {
            key: setter.request.tokenName
            , value: user.access_token
        });
        table.set({ headers: { Authorization: "Bearer " + user.access_token } });
        console.log("User loaded");
    });
    mgr.events.addUserUnloaded(function () {
        console.log("User logged out locally");
    });
    mgr.events.addAccessTokenExpiring(function () {
        console.log("Access token expiring..." + new Date());
    });
    mgr.events.addSilentRenewError(function (err) {
        console.log("Silent renew error: " + err.message);
    });
    mgr.events.addUserSignedOut(function () {
        console.log("User signed out of OP");
        mgr.removeUser();
        mgr.signinRedirect();
    });
    //输出test接口
    exports('oidcsetup', mgr);
}); 