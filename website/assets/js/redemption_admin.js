var socket = io.connect('/redemptionsocket');
socket.on('redemption', function(data){
		console.log(data);
		row = "<tr>";
		row += "<td>";
		row += data.redemptionSettings.redemption_name;
		row += "</td>";
		row += "<td>";
		row += data.user;
		row += "</td>";


		var newDate = new Date(Date.now());
		var hh = newDate.getHours();
		var mm = newDate.getMinutes();
		if(hh<10)
		{
			hh= "0"+hh;
		}
		if(mm<10)
		{
			mm= "0"+mm;
		}
		var redemptionDate = hh + ":" + mm +" " +newDate.getDate()+"/"+(newDate.getMonth()+1)+"/"+newDate.getFullYear();
		row += "<td>";
		row += data.sentData.text;
		row += "</td>";
		row += "<td>";
		row += redemptionDate;
		row += "</td>";
		row += "</tr>";
    $(row).insertAfter(".redemptionList tr:first");
})
