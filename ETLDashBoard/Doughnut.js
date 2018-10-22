($.fn.doughnut = function (d) {

	var palette = [
		"#FC9A04",
		"#070D6E",
		"#FC6604",
		"#04339C",
		"#FC3204",
		"#046664",
		"#CC0204",
		"#339904",
		"#9C0264",
		"#63CC05"
	]

	// NB: The percentage here should be expressed as a decimal: 25% = 0.25
	var getPointOnCircle = function (centerX, centerY, percent, rad) {
		var a = (2 * Math.PI * percent) - (0.5 * Math.PI);	// Remove 90deg		
		var x = rad * Math.cos(a) + centerX;
		var y = rad * Math.sin(a) + centerY;		
		return { x: x, y: y };
	}

	var getPieSlicePath = function (centerX, centerY, startPercent, endPercent, radius) {
		var point1 = getPointOnCircle(centerX, centerY, startPercent, radius);
		var point2 = getPointOnCircle(centerX, centerY, endPercent, radius);

		var flags = " 0 0 1 ";
		if(endPercent-startPercent >= 0.5)	// More than 50% of the arc
			flags = " 0 1 1 ";
		
		
		var path = "M" + centerX + " " + centerY + " L" + point1.x + " " + point1.y + " A" + radius + " " + radius + flags + point2.x + " " + point2.y + " L" + centerX + " " + centerY;
		return path;
	}


	let html = "<svg top=\"0\" left=\"0\" width=\"100%\" height=\"100%\" viewBox=\"0 0 1000 250\" >";

	// Graph dimensions
	let gX = 510;
	let gY = 20;
	let gW = 474;
	let gH = 208;

	// Center point
	let cX = gX + (gW / 2);
	let cY = gY + (gH / 2);

	// Radius
	let r = gH / 2;

	// Do some pre-calcs on the data...
	let Total = 0;
	var others = { Label: "Others", Value: 0 };
	for (var x = 0; x < d.Values.length; x++) {
		Total += d.Values[x].Value;
	}
	// Group statistically insignificant outcomes into "others"
	for (var x = 0; x < d.Values.length; x++)
	{
		d.Values[x].Percent = (d.Values[x].Value / Total);		
		if (d.Values[x].Percent < 0.025) {		// Less than 2.5%
			others.Value += d.Values[x].Value;
		}
	}

	others.Percent = others.Value / Total;

	// To get the shine effect without ruining the mouse over, the shine is BEHIND the sections. They're then rendered with a translucent mask so that the shine shows through.
	// The centre of the donut is masked full black so it is never shown.

	html += "<defs>";
	html += "   <linearGradient id=\"PieShine\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"100%\">";
	html += "       <stop offset=\"0%\" stop-color=\"white\" stop-opacity=\"1.0\" />";
	html += "       <stop offset=\"100%\" stop-color=\"white\" stop-opacity=\"0.25\" />";
	html += "   </linearGradient>";
	html += "	<mask id=\"Hub\">";
	html += "		<circle cx=\"" + cX + "\" cy=\"" + cY + "\" r=\"" + r + "\" fill=\"#999999\" />";				// This is the "normal" non-shine section
	html += "       <circle cx=\"" + cX + "\" cy=\"" + (gY - (r * 2)) + "\" r=\"" + r * 3 + "\" fill=\"white\" />";	// This produces the shine on the pie/donut
	html += "		<circle cx=\"" + cX + "\" cy=\"" + cY + "\" r=\"" + r / 2 + "\" fill=\"black\" />";				// The centre of the donut
	html += "	</mask>";
	html += "	<mask id=\"Translucent\">";
	html += "		<circle cx=\"" + cX + "\" cy=\"" + cY + "\" r=\"" + r + "\" fill=\"#cccccc\" />";				// This is the mask to make the shine show through. The more translucent the closer to the underlying white the colors will be.
	html += "		<circle cx=\"" + cX + "\" cy=\"" + cY + "\" r=\"" + r / 2 + "\" fill=\"black\" />";
	html += "	</mask>";
	html += "</defs >";

	html += "<circle cx=\"" + cX + "\" cy=\"" + cY + "\" r=\"" + r + "\" fill=\"white\" mask=\"url(#Hub)\" />";		// The white fill, combined with the mask produces the shine effect.

	html += "<rect x=\"1\" y=\"1\" width=\"998\" height=\"248\" stroke=\"#FFFFFF\" fill=\"none\"/>";
	html += "<text text-anchor=\"middle\" x=\"248\" y=\"50\" stroke=\"none\" fill=\"white\" font-size=\"30\">" + d.Label + "</text>";           // Main heading
	html += "<text text-anchor=\"middle\" x=\"248\" y=\"80\" stroke=\"none\" fill=\"white\" font-size=\"20\">" + d.SubLabel + "</text>";        // Sub heading
	html += "<text text-anchor=\"middle\" x=\"248\" y=\"200\" stroke=\"none\" fill=\"white\" font-size=\"135\">" + Total + "</text>";			// Main value

	html += "<rect x=\"10\" y=\"10\" width=\"484\" height=\"228\" stroke=\"#FFFFFF\" fill=\"none\"/>";
	html += "<rect x=\"505\" y=\"10\" width=\"484\" height=\"228\" stroke=\"#FFFFFF\" fill=\"none\"/>";

	

	// Compute percentage, and draw pie slice...
	let pcs = 0;
	let pce = 0;
	let color = 0;  // Index into the palette. (Note the palette colours are in complimentary order to make the change obvious)
	for (var x = 0; x < d.Values.length; x++)
	{		
		d.Values[x].Percent = (d.Values[x].Value / Total);
		console.log(x + " " + d.Values[x].Label + ": start at " + pcs + " " + d.Values[x].Value + " of " + Total + " = " + d.Values[x].Percent + "%");
		if (d.Values[x].Percent >= 0.025) {		
			pce = pcs + d.Values[x].Percent;			
			let p = getPieSlicePath(cX, cY, pcs, pce, r);			
			html += "<path d=\"" + p + "\" stroke=\"gray\" fill=\"" + palette[color] + "\" mask=\"url(#Translucent)\" ><title>" + d.Values[x].Label + ": " + d.Values[x].Value + "</title></path>";
			
			/*
			var pcc = (pcs + ((pce - pcs) / 2));
			console.log(pcc);
			var textCentre = getPointOnCircle(cX, cY, pcc, r);

			html += "<text text-anchor=\"middle\" x=\"" + textCentre.x + "\" y=\"" + textCentre.y + "\" fill=\"white\">" + d.Values[x].Label + "</text>";			
			*/
			pcs = pce;	// Start becomes end
			color++;
		}
		else
		{
			console.log(x + " " + d.Values[x].Label + ": Less than 2.5% -grouped into \"Other\"");
		}
	}
	if (others.Value > 0)
	{
		pce = pcs + others.Percent;
		let p = getPieSlicePath(cX, cY, pcs, pce, r);
		html += "<path d=\"" + p + "\" stroke=\"gray\" fill=\"" + palette[color] + "\" mask=\"url(#Translucent)\" ><title>Other: " + others.Value + "</title></path>";
	}
	
	html += "</svg>";

	this.html(html);
	return this;
}
)