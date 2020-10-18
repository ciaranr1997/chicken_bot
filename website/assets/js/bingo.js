$("div.tile").click(function() {
  if(!$(this).hasClass("checked"))
	{
		el = this
		id = $(this).attr("id").replace("card-","");
		$.ajax({
				 url: "/requests/bingo_user/check",
				 method: "POST",
				 data: { id: id }
		 }).then(function(data) {
				if(data.success)
				{
					$(el).addClass("checked");
				}
				else if (data.error)
				{
					if(data.error=="Denied")
					{
						alert("This has not been called yet");
					} else
					{
						alert("There has been an error doing this. Please refresh the page and try again :(\n\n"+data.error);
					}

				}
		 });
	}

});
