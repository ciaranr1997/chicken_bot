$( document ).ready(function()
{

	$.ajax({
			 url: "/requests/twitch/check"
	 }).then(function(data) {
			if(data[0])
			{
				console.log(data);
				var replaced = $("body").html().replace('{PLACEHOLDER}','<p>FOWL IS LIVE, GO CHECK HIM OUT :D</p>');
				$("body").html(replaced);
			}
			else if (data.error)
			{
				
			}
			else
			{
				$.ajax({
						 url: "/requests/twitch/offlineimg"
				 }).then(function(data) {
						if(data[0])
						{
							console.log(data[0]["offline_image_url"]);
							var replaced =  $("body").html().replace('{PLACEHOLDER}','<div class="logoarea" width="100%"><br/><br/><p>Fowl is sleep</p><br/><img src="'+data[0]["offline_image_url"]+'" width="30%" height="auto" ><br/><br/><br/><p style="width:30%; margin:auto">'+data[0]["description"]+'</p></div>');
							$("body").html(replaced);
						}
						else if (data.error)
						{

						}
				 });
			}
	 });
});
