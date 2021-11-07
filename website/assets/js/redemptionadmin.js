/****** Redemptions *****/


$(".redemptionArea").on("click", ".enable" ,function()
{
	id=$(this).attr("id").replace("enable-","");
	$.ajax({
			 url: "/requests/redemption_admin/enable",
			 method: "POST",
			 data: { id: id }
	 }).then(function(data) {
			if(data.success)
			{
				$("#row-"+id).removeClass("disabled");
			}
			else if (data.error)
			{
					alert("There has been an error doing this. Please refresh the page and try again :(\n\n"+data.error);
			}
	 });
});


$(".redemptionArea").on("click", ".disable", function()
{
	id=$(this).attr("id").replace("disable-","");

	$.ajax({
			 url: "/requests/redemption_admin/disable",
			 method: "POST",
			 data: { id: id }
	 }).then(function(data) {
			if(data.success)
			{
				$("#row-"+id).addClass("disabled");
			}
			else if (data.error)
			{
					alert("There has been an error doing this. Please refresh the page and try again :(\n\n"+data.error);
			}
	 });
});

$(".redemptionArea").on("click", ".delete", function()
{
	var safeguard = confirm("Are you sure you wish to delete this? This can't be reversed");
	if(!safeguard) return;
	id=$(this).attr("id").replace("delete-","");

	$.ajax({
			 url: "/requests/redemption_admin/delete",
			 method: "POST",
			 data: { id: id }
	 }).then(function(data) {
			if(data.success)
			{
				$("#row-"+id).remove();
			}
			else if (data.error)
			{
					alert("There has been an error doing this. Please refresh the page and try again :(\n\n"+data.error);
			}
	 });
});


$("#fileUpload").click(function()
{
	window.open("/admin/upload","Upload a file","height=200px,width=200px");
});
$("#addNew").click(function()
{
	var box ="<div class='add-new'>";
	box +="<h2 class='new-title'>New redemption</h2>";
	box +="<label for='new-name'>Name:</label>";
	box +="<input id='new-name' placeholder='Name'>";

	box +="<label for='new-description'>Description:</label>";
	box +="<textarea id='new-description' placeholder='Description'></textarea>";
	box +="<label for='new-cost'>Cost:</label>";
	box +="<input id='new-cost' type=number placeholder='Cost' value=250>";

	box +="<label for='text'>Enable Text:</label>";
	box +="<select id=text><option value='1'>Yes</option><option value='0'>No</option></select>";
	box +="<label for='tts'>Enable TTS:</label>";
	box +="<select id=tts><option value='0'>No</option><option value='1'>Yes</option></select>";
	box +="<button id='defaultAlerts'>Use Default Alert Settings</button>"
	//get list of all files
	box +="<label for='mediaType'>Media Type:</label>";
	box +="<select id='mediaType'><option val=''>Select...</option><option value=video>Video</option><option value=audio>Audio Only</option><option value=image>Image Only</option><option value=imageaudio>Image And Audio</option></select>";
	box +="<button id='new-cancel'>Cancel</button>"
	box +="</div>";
	$("body").append(box);
})


$('body').on("click","#new-cancel",function()
{
	$(".add-new").remove();
})
$('body').on("click","#edit-cancel",function()
{
	$(".edit-panel").remove();
})

$('body').on("click","#defaultAlerts",function()
{
	$('#vidLabel').remove();
	$('#videoPath').remove();
	$('#audLabel').remove();
	$('#audioPath').remove();
	$('#imgLabel').remove();
	$('#imagePath').remove();
	$('#new-save').remove();

	$('#mediaType').val("video");
	$('#mediaType').after("<label id='vidLabel' for='videoPath'>Video Path:</label><input id='videoPath' value='/static/videos/chicken_alert.mp4'>");
	$('#new-cancel').before("<button id='new-save'>Save!</button>");
})
$('body').on("change","#mediaType",function()
{
	$('#vidLabel').remove();
	$('#videoPath').remove();
	$('#audLabel').remove();
	$('#audioPath').remove();
	$('#imgLabel').remove();
	$('#imagePath').remove();
	$('#new-save').remove();



	if($('#mediaType').val()==""||$('#mediaType').val()=="Select...")
	{

		return;
	}
	//get media list of matching media
	$.ajax({
			 url: "/requests/redemption_admin/getmedia",
			 method: "POST",
			 data: { type: $('#mediaType').val() }
	 }).then(function(data) {
			if(data.video)
			{
				files ="<select id='videoPath'><option val='0'>Select...</option>";


				for(i=0;i<data.video.length;i++)
				{
					files += "<option val='/static/videos/"+data.video[i]+"'>/static/videos/"+data.video[i]+"</option>"
				}
				files +="</select>";
				$('#mediaType').after("<label id='vidLabel' for='videoPath'>Video Path:</label>"+files);
			}
			if(data.audio)
			{
				files ="<select id='audioPath'><option val='0'>Select...</option>";


				for(i=0;i<data.audio.length;i++)
				{
					files += "<option val='/static/audio/"+data.audio[i]+"'>/static/audio/"+data.audio[i]+"</option>"
				}
				files +="</select>";
				$('#mediaType').after("<label id='audLabel' for='audioPath'>Audio Path:</label>"+files);

			}
			if(data.images)
			{
				files ="<select id='imagePath'><option val='0'>Select...</option>";


				for(i=0;i<data.images.length;i++)
				{
					files += "<option val='/static/images/"+data.images[i]+"'>/static/images/"+data.images[i]+"</option>"
				}
				files +="</select>";
				$('#mediaType').after("<label id='imgLabel' for='imagePath'>Image Path:</label>"+files);
			}
			$('#new-cancel').before("<button id='new-save'>Save!</button>");
			if (data.error)
			{
					alert("There has been an error doing this. Please refresh the page and try again :(\n\n"+data.error);
			}
	 });
})

$("body").on("click", "#new-save" ,function()
{

	if($("#audioPath").length==0)
	{
		audiourl = null;
	}
	else
	{
		audiourl = $("#audioPath").val();
	}
	if($("#audioPath").length==0)
	{
		audiourl = null;
	}
	else
	{
		audiourl = $("#audioPath").val();
	}
	if($("#videoPath").length==0)
	{
		videourl = null;
	}
	else
	{
		videourl = $("#videoPath").val();
	}

	if($("#imagePath").length==0)
	{
		imageurl = null;
	}
	else
	{
		imageurl = $("#imagePath").val();
	}
	$.ajax({
		//(redemption_name,redemption_description,hastext,allowtts,imageurl,audiourl,videourl,cost)
			 url: "/requests/redemption_admin/new",
			 method: "POST",
			 data:
			 {
				 name: $("#new-name").val(),
				 description: $("#new-description").val(),
				 text: $("#text").val(),
				 tts: $("#tts").val(),
				 imageUrl:imageurl,
				 audioUrl:audiourl,
				 videoUrl:videourl,
				 cost: $("#new-cost").val()
			 }
	 }).then(function(data) {
			if(data.success)
			{
				$('.add-new').remove();
				location.reload();
			}
			else if (data.error)
			{
					alert("There has been an error doing this. Please refresh the page and try again :(\n\n"+data.error);
			}
	 });
});



$(".edit").click(function()
{
	var id = $(this).attr("id").replace("edit-",'');
	$.ajax({
			 url: "/requests/redemption_admin/details",
			 method: "POST",
			 data:
			 {
				 id:id
			 }
	 }).then(function(data) {
			if(data.success)
			{
				var box ="<div class='edit-panel'>";
				box +="<h2 class='edit-title'>Editing "+data.result.id+"("+data.result.redemption_name+")</h2>";
				box +="<label for='edit-name'>Name:</label>";
				box +="<input id='edit-name' placeholder='Name' value='"+data.result.redemption_name+"'>";

				box +="<label for='edit-description'>Description:</label>";
				box +="<textarea id='edit-description' placeholder='Description'>"+data.result.redemption_description+"</textarea>";
				box +="<label for='edit-cost'>Cost:</label>";
				box +="<input id='edit-cost' type=number placeholder='Cost' value="+data.result.cost+">";

				box +="<label for='text'>Enable Text:</label>";
				box +="<select id='text'><option value='1' ";
				if (data.result.hastext) box+="selected";
				box+= ">Yes</option><option value='0'";
				if (!data.result.hastext) box+="selected";
				box+=">No</option></select>";
				box +="<label for='tts'>Enable TTS:</label>";
				box +="<select id='tts'><option value='0'";
				if (!data.result.allowtts) box+="selected";
				box+=">No</option><option value='1' ";
				if (data.result.allowtts) box+="selected";
				box+=">Yes</option></select>";
				box +="<button id='defaultAlerts'>Use Default Alert Settings</button>"
				//get list of all files
				box +="<label for='mediaType'>Media Type:</label>";
				box +="<select id='mediaType'><option val=''>Select...</option>";
				box +="<option value=video ";
				if(data.result.videourl!=null)
				{
					box+="selected";
				}
				box += ">Video</option>";

				box +="<option value=audio ";
				if(data.result.audiourl!=null&&data.result.imageurl==null)
				{
					box+="selected";
				}
				box += ">Audio Only</option>";

				box +="<option value=image ";
				if(data.result.imageurl!=null&&data.result.audiourl==null)
				{
					box+="selected";
				}
				box += ">Image Only</option>";

				box +="<option value=imageaudio ";
				if(data.result.imageurl!=null&&data.result.audiourl!=null)
				{
					box+="selected";
				}
				box += ">Image And Audio</option>";

				box+="</select>";
				if(data.video)
				{
					files ="<select id='videoPath'><option val='0'>Select...</option>";


					for(i=0;i<data.video.length;i++)
					{
						sel = "";
						if("/static/videos/"+data.video[i]==data.result.videourl) sel="selected";
						console.log("/static/videos/"+data.video[i]==data.videourl);
						console.log("/static/videos/"+data.video[i]+" "+data.videourl);
						files += "<option val='/static/videos/"+data.video[i]+"' "+sel+">/static/videos/"+data.video[i]+"</option>"
					}
					files +="</select>";
					box+="<label id='vidLabel' for='videoPath'>Video Path:</label>"+files
				}
				if(data.audio)
				{
					files ="<select id='audioPath'><option val='0'>Select...</option>";


					for(i=0;i<data.audio.length;i++)
					{
						sel = "";
						if("/static/sound/"+data.audio[i]==data.result.audiourl) sel="selected";
						files += "<option val='/static/sound/"+data.audio[i]+"' "+sel+">/static/sound/"+data.audio[i]+"</option>"
					}
					files +="</select>";
					box+="<label id='audLabel' for='audioPath'>Audio Path:</label>"+files

				}
				if(data.images)
				{
					files ="<select id='imagePath'><option val='0'>Select...</option>";


					for(i=0;i<data.images.length;i++)
					{
						sel = "";
						if("/static/images/"+data.images[i]==data.result.imageurl) sel="selected";
						files += "<option val='/static/images/"+data.images[i]+"'>/static/images/"+data.images[i]+"</option>"
					}
					files +="</select>";
					box+="<label id='imgLabel' for='imagePath'>Image Path:</label>"+files
				}
				box+="<button id='edit-save'>Save!</button>"
				box+= "<input value='"+id+"' id='editid' type=hidden>";
				box +="<button id='edit-cancel'>Cancel</button>"
				box +="</div>";
				$("body").append(box);
			}
			else if (data.error)
			{
					alert("There has been an error doing this. Please refresh the page and try again :(\n\n"+data.error);
			}
	 });

})
$("body").on("click", "#edit-save" ,function()
{

	if($("#audioPath").length==0)
	{
		audiourl = null;
	}
	else
	{
		audiourl = $("#audioPath").val();
	}
	if($("#audioPath").length==0)
	{
		audiourl = null;
	}
	else
	{
		audiourl = $("#audioPath").val();
	}
	if($("#videoPath").length==0)
	{
		videourl = null;
	}
	else
	{
		videourl = $("#videoPath").val();
	}

	if($("#imagePath").length==0)
	{
		imageurl = null;
	}
	else
	{
		imageurl = $("#imagePath").val();
	}
	$.ajax({
		//(redemption_name,redemption_description,hastext,allowtts,imageurl,audiourl,videourl,cost)
			 url: "/requests/redemption_admin/update",
			 method: "POST",
			 data:
			 {
				 id:$("#editid").val(),
				 name: $("#edit-name").val(),
				 description: $("#edit-description").val(),
				 text: $("#text").val(),
				 tts: $("#tts").val(),
				 imageUrl:imageurl,
				 audioUrl:audiourl,
				 videoUrl:videourl,
				 cost: $("#edit-cost").val()
			 }
	 }).then(function(data) {
			if(data.success)
			{
				$('.edit-panel').remove();
				location.reload();
			}
			else if (data.error)
			{
					alert("There has been an error doing this. Please refresh the page and try again :(\n\n"+data.error);
			}
	 });
});
