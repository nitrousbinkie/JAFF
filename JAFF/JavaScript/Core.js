function MessageBox(heading, message, buttons)
{
    $("#messageBoxMask").fadeIn(250);
    $("#messageBoxHeading").text(heading);
    $("#messageBoxBody").text(message);

    $("#messageBoxButtons").empty();
}

function AttachToolTips() {       
    $(".tooltipenabled").hover(function () {        
        var p = $(this).offset();
        var t = $(this).attr("tooltip");
        console.log("Tooltip: " + t);
        ShowToolTip(p.left, p.top - ($("#divToolTip").height() + 13), t);
    },
    function () {
        HideToolTip();
    })
}

function ShowToolTip(xpos, ypos, message) {

    if (ypos < 0)	// Account for tooltips off the top of the page
    {
        ypos = 12;
        xpos += 37;
    }

    $("#divToolTip").hide();
    $("#divToolTip").text(message);
    $("#divToolTip").css("left", xpos + "px");
    $("#divToolTip").css("top", ypos + "px");
    $("#divToolTip").css("z-index", "1000");
    $("#divToolTip").fadeIn(250);
}

function HideToolTip() {
    $("#divToolTip").fadeOut(250);
}