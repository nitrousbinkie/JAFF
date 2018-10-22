($.fn.statusGraph = function (d) {

    console.log("statusGraph => Data: ");
    console.log(d);

    let values =
        {
            Insert: 0,
            Update: 0,
            Reset: 0,
            Synced: 0,
            Dialled: 0,
            Uploading: 0,
            Error: 0
        };

    let TotalRecords = 0;
    for (var x = 0; x < d.Rows.length; x++) {
        TotalRecords += d.Rows[x]["Count"];
        switch (d.Rows[x]["StateName"]) {
            case "Waiting Insert":
                values["Insert"] = d.Rows[x]["Count"];
                break;
            case "Waiting Update":
                values["Update"] = d.Rows[x]["Count"];
                break;
            case "Waiting Reset Counters":
                values["Reset"] = d.Rows[x]["Count"];
                break;
            case "Synced":
                values["Synced"] = d.Rows[x]["Count"];
                break;
            case "Dialled":
                values["Dialled"] = d.Rows[x]["Count"];
                break;
            case "Uploading":
                values["Uploading"] = d.Rows[x]["Count"];
                break;
            case "Upload Error":
                values["Error"] = d.Rows[x]["Count"];
                break;
            default:
                break;
        }
    }

    let percentages = {}
    for (var x in values) {
        percentages[x] = values[x] / TotalRecords * 100;
    }


    console.log("statusGraph => Data processed: ");
    console.log(values);
    //console.log(percentages);

    let colors =
        {
            Insert: "#f7fbff",
            Update: "#c6dbef",
            Reset: "#e5f5e0",
            Synced: "#2171b5",
            Dialled: "#08306b",
            Uploading: "#6baed6",
            Error: "#AA0000"
        }

    let html = "<svg top=\"0\" left=\"0\" width=\"100%\" height=\"100%\" viewBox=\"0 0 1000 20\">";

    html += "<defs>";
    html += "   <linearGradient id=\"Shape\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"100%\">";
    html += "       <stop offset=\"0%\" stop-color=\"#000000\" stop-opacity=\"0.0\" />";
    html += "       <stop offset=\"100%\" stop-color=\"#000000\" stop-opacity=\"0.75\" />";
    html += "   </linearGradient>";
    html += "</defs >";

    var px = 0;
    var labelx = 0;
    for (var x in percentages) {
        html += "<rect x=\"" + px + "\" y=\"1\" width=\"" + percentages[x] * 10 + "\" height=\"18\" stroke=\"none\" fill=\"" + colors[x] + "\" />";
        html += "<rect x=\"" + px + "\" y=\"1\" width=\"" + percentages[x] * 10 + "\" height=\"18\" stroke=\"none\" fill=\"url(#Shape)\" />";
        html += "<rect x=\"" + px + "\" y=\"1\" width=\"" + percentages[x] * 10 + "\" height=\"9\" stroke=\"none\" fill=\"white\" fill-opacity=\"0.2\" />";
        labelx = px + ((percentages[x] * 10) / 2);
        if (percentages[x] > 0) {
            html += "<text text-anchor=\"middle\" x=\"" + labelx + "\" y=\"14\" font-family=\"'Audiowide', sans-serif\" stroke=\"none\" fill=\"white\" font-size=\"10\">" + x + " -" + values[x] + " (" + Math.round(percentages[x]) + "%)</text>";
        }
        html += "<rect x=\"" + px + "\" y=\"1\" width=\"" + percentages[x] * 10 + "\" height=\"18\" stroke=\"#FFFFFF\" fill=\"none\" />";
        px += percentages[x] * 10;
    }

    html += "</svg >";

    this.html(html);

    return this;
})

    ($.fn.statPanel = function (data) {
       
        let d = data;
        console.log(d);

        let html = "<svg top=\"0\" left=\"0\" width=\"100%\" height=\"100%\" viewBox=\"0 0 1000 250\">";

        html += "<defs>";
        html += "   <linearGradient id=\"GraphFill_" + d.Fill + "\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"100%\">";
        html += "       <stop offset=\"0%\" stop-color=\"" + d.Fill + "\" stop-opacity=\"1.00\" />";
        html += "       <stop offset=\"50%\" stop-color=\"" + d.Fill + "\" stop-opacity=\"0.10\" />";
        html += "   </linearGradient>";
        html += "</defs >";

        html += "<clipPath id=\"graphPlot\">";
        html += "   <rect x=\"503\" y=\"10\" width=\"489\" height=\"228\" />";
        html += "</clipPath>";

        html += "<rect x=\"1\" y=\"1\" width=\"998\" height=\"248\" stroke=\"#FFFFFF\" fill=\"none\"/>";
        html += "<text text-anchor=\"middle\" x=\"248\" y=\"50\" stroke=\"none\" fill=\"white\" font-size=\"30\">" + d.Label + "</text>";           // Main heading
        html += "<text text-anchor=\"middle\" x=\"248\" y=\"80\" stroke=\"none\" fill=\"white\" font-size=\"20\">" + d.SubLabel + "</text>";        // Sub heading
        html += "<text text-anchor=\"middle\" x=\"248\" y=\"200\" stroke=\"none\" fill=\"white\" font-size=\"135\">" + d.Value + "</text>";         // Main value

        // Top right corner
        let px = 990;
        let py = 10;

        // Graph the last 24hrs. Start top right, work back to the left...
        // Current value is d.Values[0]. This is our max scale point
        let vMax = parseInt(d.Values[0].Value);
        for (var x = 0; x < d.Values.length; x++) {            
            //console.log(d.Values[x].Value + " " + vMax + " " + (d.Values[x].Value > vMax));
            if (d.Values[x].Value > vMax) { vMax = d.Values[x].Value; }
        }
        let yIncrement = (230.0 / vMax);            // 230 is available height and v is our max value.
        let xIncrement = (498 / d.Values.length);   // 498 is available width
        //console.log("V_Max: " + vMax);
        //console.log("yIncrement: " + yIncrement);

        // We're building somethign like the below:
        //<path d="M180 41 L180 199 M200 41 L200 199 M220 41 L220 199 M240 41 L240 199 M260 41 L260 199 M280 41 L280 199 M300 41 L300 199 M320 41 L320 199 M340 41 L340 199 M360 41 L360 199 M380 41 L380 199 M400 41 L400 199 M420 41 L420 190 M440 41 L440 170" STROKE="#002E3F" />        

        let pathElements = "";
        let majorLineElements = "";
        let minorLineElements = "";
        let labels = "";
        let labelY = 155;   // First position. We iterate through 3 so that labels don't clash               

        for (var x = 0; x < d.Values.length; x++)
        {            
            v = d.Values[x].Value;            
            if (x % d.MajorLines == 0) {
                console.log("Adding label");
                labels += "<text text-anchor=\"middle\" x=\"" + px + "\" y=\"" + labelY + "\" fill=\"white\" stroke=\"none\" font-size=\"12\" fill-opacity=\"0.75\" clip-path=\"url(#graphPlot)\">" + d.Values[x].Label + "</text>";
                labelY = (labelY == 125 ? 155 : (labelY == 155 ? 95 : 125));
                majorLineElements = "M" + px + " 10 L" + px + " 239 " + majorLineElements;
            }
            else if (x % d.MinorLines == 0) {
                minorLineElements = "M" + px + " 10 L" + px + " 239 " + minorLineElements;
            }

            py = 239 - (yIncrement * v); // 230 is available height, 239 is the bottom of the graph panel
            //console.log("yIncrement: " + yIncrement + " v: " + v + " => (yIncrement*v): " + (yIncrement*v) + " py: " + py);
            pathElements = "L" + px + " " + py + " " + pathElements;
            px -= xIncrement;
        }

        // Create a square grid by drawing guide lines at the xIncrement spacing
        let horizLineElements = "";        
        for (var y = 10; y < 230; y+= (xIncrement * d.MinorLines)) {
            horizLineElements += "M503 " + y + " L990 " + y + " ";            
        }


        //console.log(pathElements);
        pathElements = "M" + px + " " + py + " " + pathElements + "L990 239 L" + px + " 239 L" + px + " " + py;      // Move to the start, then draw the path, then close the corners

        html += "<rect x=\"10\" y=\"10\" width=\"484\" height=\"228\" stroke=\"#FFFFFF\" fill=\"none\"/>";

        html += "<path d=\"" + pathElements + "\" Stroke=\"" + d.Fill + "\" fill=\"url(#GraphFill_" + d.Fill + ")\" clip-path=\"url(#graphPlot)\" />";
        html += "<path d=\"" + minorLineElements + "\" stroke=\"white\" stroke-opacity=\"0.1\" clip-path=\"url(#graphPlot)\" />";
        html += "<path d=\"" + majorLineElements + "\" stroke=\"white\" stroke-opacity=\"0.3\" clip-path=\"url(#graphPlot)\" />";
        html += "<path d=\"" + horizLineElements + "\" stroke=\"white\" stroke-opacity=\"0.1\" clip-path=\"url(#graphPlot)\" />";        
        html += labels; // NB: gotta come after the path or we'll hide it.
        html += "<rect x=\"503\" y=\"10\" width=\"489\" height=\"228\" stroke=\"#FFFFFF\" fill=\"none\"/>";

        html += "</svg>";

        this.html(html);
        return this;
    })