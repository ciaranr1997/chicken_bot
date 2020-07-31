$(".redactbtn").click(function(e)
{
	quoteId= $(this).attr('id').replace("redact-","");
	$.ajax({
			 url: "/requests/redact/"+quoteId
	 }).then(function(data) {
			if(data.success)
			{
				$("#li-"+quoteId).remove();
			}
			else if (data.error)
			{
					alert("There has been an error doing this. Please refresh the page and try again :()");
			}
	 });
});
