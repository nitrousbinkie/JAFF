$(function () {

    var _ETL = new ETL();

    $("#btnLogin").click(function () {        

        $("#btnLogin").prop("disabled", "true");
        $("#btnLogin").text("Wait...");

        var username = $("#txtUsername").val();
        var password = $("#txtPassword").val();
        var clientid = $("#txtClientId").val();
        var accessToken = $("#txtAccessToken").val();
        _ETL.Authenticate(username, password, clientid, accessToken);
    })
    
    _ETL.Authenticated = function ()
    {
        $("#loginMask").fadeOut(250);
    }
    _ETL.AuthenticationExpired = function ()
    {
        $("#loginMask").fadeIn(250);
        $("#btnLogin").text("Login");
        $("#btnLogin").removeAttr("disabled");
        MessageBox("Login Failed", "Please reauthenticate");
    }

    $("#loadMask").delay(1000).fadeOut(2000);
});