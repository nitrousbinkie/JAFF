function MessageBox(heading, message, buttons)
{
    $("#messageBoxMask").fadeIn(250);
    $("#messageBoxHeading").text(heading);
    $("#messageBoxBody").text(message);

    $("#messageBoxButtons").empty();
}