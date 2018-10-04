var ETL = function () {
    this.SessionToken = "";
    console.log("ETL => Created");

    this.Authenticated = function () { };
    this.AuthenticationExpired = function () { };
}

ETL.prototype.Authenticate = function(username, password, clientid, accesstoken)
{
    console.log("ETL => Authenticate Entered");

    var body =
        {
            username: username,
            password: password,
            accesstoken: accesstoken,
            clientid: clientid
        };


    var successcallback = function (ETL) {
        return function (data) {
            ETL.SessionToken = data.Token;
            ETL.Authenticated();
        }
    }

    var errorcallback = function (ETL) {
        return function (data) {
            ETL.AuthenticationExpired();
        }
    }

    $.ajax({
        url: "https://etl.ultraasp.net/ETLAuth",
        method: "POST",
        crossDomain: true,
        data: JSON.stringify(body),
        cache: false,
        success: successcallback(this),
        error: errorcallback(this)
    });
}