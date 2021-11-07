$("#send-event").click(function()
{
	var eventname = $("#evtname").val();
	$.ajax({
			 url: "/requests/twitch_admin/",
			 method: "POST",
			 data: { txt:eventname  }
	 }).then(function(data) {

			 console.log(data);
			if(data.success)
			{
			}
			else if (data.error)
			{
					alert("There has been an error doing this. Please refresh the page and try again :(\n\n"+data.error);
					console.log(data.error);
			}
	 });
})
