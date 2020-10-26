
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
$( document ).ready(function() {
	if($('.checked').length==16)
	{
		callBingo();
	}
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
