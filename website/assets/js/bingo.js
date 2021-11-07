
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
					//check if all cards and now selected
					if($('.checked').length==16)
					{
						callBingo();
					}
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
function callBingo()
{
	bingo = "<div class='bingo-called'><img src='/static/images/bingo.png'/></div>";
	$("body").append(bingo);
  confetti.start();
	playAudio();
	$(".bingo-called").fadeIn( "slow", function() {
		setTimeout(function(){ confetti.stop(); pauseAudio(); }, 3000);

  });
}
/*$( document ).ready(function() {
	if($('.checked').length==16)
	{
		callBingo();
	}
});*/
$("#bingo-btn").click(function()
{
	getLines();
});


function playAudio() {
	x = document.getElementById("clapping");
	x.volume = 0.05
  x.play();
}

function pauseAudio() {
	x = document.getElementById("clapping");
  x.pause();
}


function getLines()
{

	if(checkedLen<4)
	{
		alert("It is not possible for you to have a full line yet. Behave");
	}
	else
	{
		var grid = [];
		grid[0]=[];
		grid[1]=[];
		grid[2]=[];
		grid[3]=[];

		var checkedLen = $('.checked').length;
		$(".tile").each(function(i,e)
		{
			x=i;
			if(i<4) y=0;
			if(i>3&&i<8){ y=1;x = i-4 };
			if(i>7&&i<12) { y=2; x = i-8};
			if(i>11) { y=3; x = i-12 };
			grid[x][y] = $(e).hasClass("checked");
		});
		var rows=0;
		console.log(grid);
		for(i=0;i<grid.length;i++)
		{
			falsecount = 0;
			for(u=0;u<grid[i].length;u++)
			{
				if(grid[i][u]==false)
				{
					falsecount++;
				}

			}
			if(falsecount<1)
			{
				rows++;
			}

		}
		for(i=0;i<grid[0].length;i++)
		{
			falsecount=0;
			for(u=0;u<grid[i].length;u++)
			{
				if(grid[u][i]==false)
				{
					falsecount++;
				}
			}

			if(falsecount<1)
			{
				rows++;
			}
		}
		//diagonals suck

		if(grid[0][0]==true&&grid[1][1]==true&&grid[2][2]==true&&grid[3][3]==true) rows++;
		if(grid[3][0]==true&&grid[2][1]==true&&grid[1][2]==true&&grid[0][3]==true) rows++;
		console.log(rows);
		if(checkedLen==16)
		{
			$.ajax({
             url: "/requests/bingo_user/bingo",
             method: "POST",
             data: { type: "Full House" }
     	}).then(function(data) {
	      if(data.success)
	      {
	          $(el).addClass("checked");
	          //check if all cards and now selected
	          if($('.checked').length==16)
	          {
	              callBingo();
	          }
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
		} else if(rows==1)
		{
			$.ajax({
             url: "/requests/bingo_user/bingo",
             method: "POST",
             data: { type: "Single Line" }
     	}).then(function(data) {
	      if(data.success)
	      {

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
		} else if(rows>=2)
		{
			$.ajax({
             url: "/requests/bingo_user/bingo",
             method: "POST",
             data: { type: "2 Lines" }
     	}).then(function(data) {
	      if(data.success)
	      {
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
		} else
		{
			console.log(rows);
		}
	}
}
