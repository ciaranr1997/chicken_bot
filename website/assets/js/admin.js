/****** Bingo *****/
var row="<tr class=\"option\" id=\"row-$id\">";
row+="<td><span class=\"optionText\">$text</span><input id=\"val-$id\" hidden val=\"$text\" class=\"valIn\"></td>";
row+="<td><span class=\"optionDifficulty\">$difficulty</span><input type=number hidden id=\"dif-$id\" val=\"$difficulty\"></td>";
row+="<td><button class=\"edit\" id=\"edit-$id\">Edit</button><button class=\"save\" id=\"save-$id\">Save</button><button class=\"disable\" id=\"disable-$id\">Disable</button><button class=\"enable\" id=\"enable-$id\">Enable</button>";
row+="<input type='checkbox' class=\"checkSquare\" id=\"check-$id\">";
row+="</td>";
row+="</tr>";

$(".cardArea").on("click", ".save", function()
{
	if($(this).attr('id')=="save-new")
	{//new item

		//reject conditions:
		if($("#val-new").val()=="")
		{
			alert("Please give a value for the square");
			return;
		}
		if(
			isNaN($("#dif-new").val())||
			$("#dif-new").val()<1||
			$("#dif-new").val()>3
		)
		{
			alert("Please give a difficulty");
			return;
		}
		//send details to page
		$.ajax({
				 url: "/requests/bingo_admin/new",
				 method: "POST",
				 data: { text: $("#val-new").val(), difficulty: $("#dif-new").val() }
		 }).then(function(data) {
				if(data.success)
				{
					id = data.id;
					newRow = row;
					newRow = newRow.replace(/\$id/g,id).replace(/\$difficulty/g,$("#dif-new").val()).replace(/\$text/g,$("#val-new").val());
					$(newRow).insertBefore($("#row-new"))
					$("#val-new").val("");
					$("#dif-new").val("");
				}
				else if (data.error)
				{
						alert("There has been an error doing this. Please refresh the page and try again :(\n\n"+data.error);
				}
		 });
	}
	else
	{//already existing item
		id=$(this).attr("id").replace("save-","");
	}
});


$(".cardArea").on("click", ".enable" ,function()
{
	id=$(this).attr("id").replace("enable-","");
	$.ajax({
			 url: "/requests/bingo_admin/enable",
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

$(".cardArea").on("click", ".checkSquare" ,function()
{
	id=$(this).attr("id").replace("check-","");
	checked = $(this).is(":checked") ? 1 : 0
	$.ajax({
			 url: "/requests/bingo_admin/check",
			 method: "POST",
			 data: { id: id, value: checked}
	 }).then(function(data) {
			if(data.success)
			{

			}
			else if (data.error)
			{
					alert("There has been an error doing this. Please refresh the page and try again :(\n\n"+data.error);
			}
	 });
});

$(".cardArea").on("click", ".disable", function()
{
	id=$(this).attr("id").replace("disable-","");

	$.ajax({
			 url: "/requests/bingo_admin/disable",
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
$("#bingo-toggle").click(function()
{
	if($(this).hasClass("open"))
	{
			new_status = 0;

			$(this).addClass("closed");
			$(this).removeClass("open");
			$(this).html("Open Bingo!");
	}
	else
	{
			new_status = 1;
			$(this).addClass("open");
			$(this).removeClass("closed");
			$(this).html("Close Bingo!");
	}

	$.ajax({
			 url: "/requests/bingo_admin/status",
			 method: "POST",
			 data: { new_status: new_status }
	 }).then(function(data) {
			if(data.success)
			{

			}
			else if (data.error)
			{
					alert("There has been an error doing this. Please refresh the page and try again :(\n\n"+data.error);
			}
	 });
});
$("#reset").click(function()
{
	r = confirm("Are you sure you want to do this? Everyone will have to get a new card generated for them");
	if(r == true)
	{
		$.ajax({
				 url: "/requests/bingo_admin/reset",
				 method: "POST"
		 }).then(function(data) {
				if(data.success)
				{

				}
				else if (data.error)
				{
						alert("There has been an error doing this. Please refresh the page and try again :(\n\n"+data.error);
				}
		 });
	}
});
$(".cardArea").on("click", ".edit" ,function()
{
	id=$(this).attr("id").replace("edit-","");
	$("#row-"+id+" span").hide();
	$("#row-"+id+" input").show();
	$("#row-"+id+" input").removeAttr("hidden");
	$("#save-"+id).show();
	$(this).hide();
});
$(".cardArea .difInput").on("input",function()
{
	if(isNaN($(this).val()))
	{
		$(this).val(1);
	}
	else if($(this).val()<1)
	{
		$(this).val(1);
	}
	else if ($(this).val()>3)
	{
		$(this).val(3);
	}
});
