var imgSrc = "/static/images/bingo.png"
function bingoCalled(username,type)
{

	playAudio();
	var div = document.createElement("div");
	div.style.backgroundImage = "url('"+imgSrc+"')";
	div.style.height = "468px";
	div.style.width = "574px";
	div.innerHTML = "<center><h1 style='position:fixed; top:150px;width:574px; color:white;-webkit-text-stroke: 1px black;'>"+username+"<br/> has called bingo for<br/>  "+type+"</h1></center>";
	div.id="winMsg";
	div.style.display = "none";

	//"<div class='winDiv' style='background-image: url(\"/static/images/bingo.png\");'>";
	//div += "";
	//div+= "</div>";

	$("body").append(div);
	$("#winMsg").fadeIn( "slow", function() {
		setTimeout(function(){ pauseAudio(); $("#winMsg").remove();}, 10000);
  });
}

var socket = io.connect('/bingosocket');
socket.on('bingo', function(data){
     // do cool stuff
    bingoCalled(data.user,data.type);
})


function playAudio() {
	x = document.getElementById("clapping");
	x.volume = 0.05
  x.play();
}
function pauseAudio() {
	x = document.getElementById("clapping");
  x.pause();
}
