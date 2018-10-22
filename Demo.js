

$(function () {

    var _ETL = new ETL();    

    var _RefreshTimeout = undefined;

    $("#txtUsername").val(Cookies.get("session_username"));
    $("#txtClientId").val(Cookies.get("session_clientid"));
    $("#txtAccessToken").val(Cookies.get("session_accessToken"));    

    $("#btnLogin").click(function () {

        $("#btnLogin").prop("disabled", "true");
        $("#btnLogin").text("Wait...");
        var username = $("#txtUsername").val();
        var password = $("#txtPassword").val();
        var clientid = $("#txtClientId").val();
        var accessToken = $("#txtAccessToken").val();
        Cookies.set("session_username", username);
        Cookies.set("session_clientid", clientid);
        Cookies.set("session_accessToken", accessToken);

        _ETL.Authenticate(username, password, clientid, accessToken);
    });

    $("#btnLogout").click(function () {
        console.log("Logout");
        _ETL.AuthenticationExpired();
    });

    var refreshStatsCallBack = function () {
        console.log("refreshCallback");

        // Download the current status of the lead store table
        var successCallBack = function (data) {
            $("#divStatusGraph").statusGraph(data);
        };

        var errorCallBack = function (data) {
            // TODO: Call to central logout method (Once it exists!)
            _ETL.AuthenticationExpired();
        };

        let qp =
            {
                page: 1,
                rowsPerPage: 100
            };
        qp = JSON.stringify(qp);
        _ETL.LoadData("Counts", qp, successCallBack, errorCallBack);
        _RefreshTimeout = setTimeout(refreshStatsCallBack, 3000);
    };    
    var refreshUploadStats = function () {
        console.log("refreshUploadStats()");

        var successCallback = function (data) {      
            let graphConfig = {
                Label: "Uploaded",
                SubLabel: "(Last 24hrs)",
                Fill: "#6baed6",
                MinorLines:6,
                MajorLines:36,
                Value: 0,
                Values: []
            };

            let vNow = data.Rows[0]["Total Records"];
            let vOld = data.Rows[data.Rows.length-1]["Total Records"];

            for (var x = 0; x < data.Rows.length; x++) {
                let item = {
                    Label: data.Rows[x].TimeStampUTC,
                    Value: data.Rows[x]["Total Records"] - vOld    // Additional records since 24hrs ago
                };
                console.log(item.Label + ": " + item.Value);
                graphConfig.Values.push(item);                  
            }

            graphConfig.Value = vNow - vOld;

            $("#divStatPanelUploads").statPanel(graphConfig);
        }

        var errorCallback = function (data) {
            _ETL.AuthenticationExpired();
        }

        let qp = {
            rowsperpage:144,       // Last 24hrs based on 10 the minute snapshots...
            order:["Id desc"]
        }
        qp = JSON.stringify(qp);

        _ETL.LoadData("Stats", qp, successCallback, errorCallback);
    };
    var refreshOutcomeStats = function () {
        var successcallback = function (data) {

            var cfg =
                {
                    Label: "Total Dispositions",
                    SubLabel: "(Since Launch)",
                    Values:
                        [

                        ]
                };
            for (var x = 0; x < data.Rows.length; x++) {
                var i = { Label: data.Rows[x].Description, Value: data.Rows[x].Count };
                cfg.Values.push(i);
            }
            $("#divStatPanelOutcomes").doughnut(cfg);
            //setTimeout(refreshOutcomeStats, 10000);
        };

        var errorcallback = function () {
            _ETL.AuthenticationExpired();
        };

        let qp = {};
        _ETL.LoadData("DispositionCounters", qp, successcallback, errorcallback);
    };
    var refreshTimeToCall = function () {
        var successCallback = function (data) {

            console.log("Success!");
            console.log(data);

            let config = {
                Label: "Best Contact Times",
                SubLabel: "",
                Value: "",
                Fill: "#FFA000",
                MinorLines: 1,
                MajorLines: 3,
                Values: [               
                ]
            }

            for (var x = 0; x < data.Rows.length; x++) {
                let item = {
                    Label: data.Rows[x]["Time"] + ":00",
                    Value: parseInt(data.Rows[x]["Calls"])
                }
                config.Values.push(item);
            }

            let t = 0;
            let vMax = 0;
            let lMax = "";
            for (var x = 0; x < config.Values.length; x++) {
                t += config.Values[x].Value;
                if (parseInt(config.Values[x].Value) > vMax) {
                    vMax = config.Values[x].Value;
                    lMax = config.Values[x].Label;
                }
            }

            config.SubLabel = parseInt((vMax / t) * 100) + "% at"
            config.Value = lMax;

            $("#divTimeToCall").statPanel(config);
        }
        var errorCallback = function (data) {
            _ETL.AuthenticationExpired();
        }       
              
        _ETL.LoadData("TimeOfDay", "{order:[\"Time desc\"]}", successCallback, errorCallback);        
    }

    _ETL.Authenticated = function () {
        // Remember some of the details...
        Cookies.set("session_sessionToken", _ETL.SessionToken);

        $("#loginMask").fadeOut(1000);

        refreshStatsCallBack();
        refreshUploadStats();
        refreshOutcomeStats();
        refreshTimeToCall();
    };
    _ETL.AuthenticationExpired = function () {
        $("#loginMask").fadeIn(250);
        $("#btnLogin").text("Login");
        $("#btnLogin").removeAttr("disabled");
        MessageBox("Login Failed", "Please reauthenticate");
        Cookies.set("session_sessionToken", "");
    };

    if (Cookies.get("session_sessionToken") !== "")
    {
        _ETL.SessionToken = Cookies.get("session_sessionToken");
        _ETL.ClientId = Cookies.get("session_clientid");

        _ETL.Authenticated();
    }

    AttachToolTips();
    $("#loadMask").delay(1000).fadeOut(2000);
});