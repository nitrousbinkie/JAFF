var ETL = function () {
    this.SessionToken = "";
    this.ClientId = "";

    console.log("ETL => Created");

    this.Authenticated = function () { };
    this.AuthenticationExpired = function () { };
}

ETL.prototype.Authenticate = function(username, password, clientid, accesstoken)
{
    console.log("ETL => Authenticate Entered");

    this.ClientId = clientid;

    var body =
        {
            username: username,
            password: password,
            accesstoken: accesstoken,
            clientid: clientid
            //issuecookie: true     // TODO: Re-enable this when I work out why it doesn't work!!
        };


    var successcallback = function (ETL) {
        return function (data) {
            data = JSON.parse(data);
            ETL.SessionToken = data.Token;

            console.log(ETL.SessionToken);
            ETL.Authenticated();
        }
    }

    var errorcallback = function (ETL) {
        return function (data) {
            ETL.SessionToken = "";
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

ETL.prototype.LoadData = function (dataset, queryParameters, successCallBack, errorCallBack)
{
    console.log("ETL => LoadData(" + dataset + ")");

    var setHeader = function (ETL) {
        return function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + ETL.SessionToken);
        }
    }

    $.ajax({
        url: "https://etl.ultraasp.net/" + this.ClientId + "/ETL/" + dataset,
        method: "POST",
        crossDomain: true,
        data: queryParameters,
        cache: false,
        beforeSend: setHeader(this),
        success: successCallBack,
        error: errorCallBack
    });
}