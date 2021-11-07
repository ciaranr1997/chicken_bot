var alertShowing = false;
var socket = io.connect('/redemptionsocket');
socket.on('redemption', function(data){
     // do cool stuff
		 if(!alertShowing&&queue.items.length==0)
		 {
			 showRedemption(data);
		 } else
		 {
			 queue.add(data);
		 }
})
socket.on('confirm', function(data){
     // do cool stuff
		 console.log(data);
})
function showRedemption(data)
{
	alertShowing = true;
	var textBox = "<p class='textBox'>"+data.user+" has redeemed "+data.redemptionSettings.redemption_name+"<p>";
	if(data.sentData.text!=null)
	{
		textBox+= "<p class='textBox'>"+data.sentData.text+"</p>";
	}
	if(data.redemptionSettings.imageurl!=null&&data.redemptionSettings.imageurl!="")
	{
		$('.alertArea').append('<img id="alertImg" src="'+data.redemptionSettings.imageurl+'">'+textBox);
		if(data.redemptionSettings.audiourl!=null&&data.redemptionSettings.audiourl!="")
		{
			 var music = new Audio(data.redemptionSettings.audiourl);
			 music.play();
			 music.loop =false;
			 music.playbackRate = 1;
			 music.volume = 0.2;
			 music.onended = clearAndGoNext(data);
		} else
		{
			clearAndGoNext(data);
		}
	}
	else if(data.redemptionSettings.audiourl!=null&&data.redemptionSettings.audiourl!="")
	{
		 $('.alertArea').append(textBox);
		 var music = new Audio(data.redemptionSettings.audiourl);
		 music.play();
		 music.loop =false;
		 music.playbackRate = 1;
		 music.volume = 0.2;
		 music.onend = clearAndGoNext(data);
	}
	else if(data.redemptionSettings.videourl!=null)
	{
		$('.alertArea').append('<center><video id="video" ><source src="'+data.redemptionSettings.videourl+'" type="video/mp4"></video></center>'+textBox);
		 var vid = $("#video")[0];
		 vid.volume = 0.2;
		 vid.play();
		 vid.onended = function(e)
		 {
			 clearAndGoNext(data);
		 }
	}
}

function clearAndGoNext(data)
{
	console.log("cleared");
	if(data.redemptionSettings.allowtts==1)
	{
		var msg = new SpeechSynthesisUtterance();
		msg.text = data.sentData.text;
		window.speechSynthesis.speak(msg);
		msg.onend = function(e)
		{
			$(".alertArea").html("");
			alertShowing = false;
			queue.playNext();
		}
		setTimeout(()=>
		{
			$(".alertArea").html("");
			alertShowing = false;
			queue.playNext();
		},5000)
	} else
	{
		setTimeout(()=>
		{
			$(".alertArea").html("");
			alertShowing = false;
			queue.playNext();
		},3000)
	};
}
var queue =
{

	getItems:function()
	{
		return this.items;
	},
	items:[],
	add:function(data)
	{
		this.items.push(data);
		console.log(data);
	},
	playNext:function()
	{
		if(this.items.length==0) return;
		showRedemption(this.items[0]);
		this.items.shift();
	}
}
