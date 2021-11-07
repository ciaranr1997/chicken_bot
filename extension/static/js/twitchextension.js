
(()=>{
	var userBal = -1;
	var redemptionSel = -5;

	window.Twitch.ext.onAuthorized((auth) => {
		if(Twitch.ext.viewer.id==null)
		{
			$("#mainPanel").html("");
			$( "#mainPanel" ).append("Please allow this extension access to your identity to function correctly.<br/>Without this we will be unable to retrieve your points. <br/><button id='authorizeBtn' >Authorize</button>");

			return;

		} else
		{
			getBalance();
		}
	});

	async function setBalance(newBal,callback)
	{
		$.ajax({
				 url: "https://chickenbot.gay/requests/extension/setbalance/"+Twitch.ext.viewer.id,
				 headers: {
							'Content-Type':'application/json',
							'Authorization':Twitch.ext.viewer.sessionToken
					},
					data:JSON.stringify({balance:newBal}),
 				 	type: 'POST'

		 }).then((data)=> {
				if(data)
				{
					userBal = data.points;
					$("#panel-title span#title").text(userBal+" bawks");
					if(callback)
					{
						callback();
					}
				}
				else if (data.error)
				{

				}
		 });
	}
	async function getRedemptions()
	{
		if(Twitch.ext.viewer.id==null)
		{
			$("#mainPanel").html("");
			$( "#mainPanel" ).append("Please allow this extension access to your identity to function correctly.<br/>Without this we will be unable to retrieve your points. <br/><button id='authorizeBtn''>Authorize</button>");

			return;

		}
		$.ajax({
				 url: "https://chickenbot.gay/requests/extension/redemptions"
		 }).then(function(data) {
				if(data)
				{
					var redemptions = data.redemptions;

					$( "#mainPanel" ).append('<ul id="redemptionDisplay"></ul>');

					for(i=0;i<redemptions.length;i++)
					{
						var btnVal = "";
						if(redemptions[i].cost>userBal)
						{
							btnVal = "disabled";
						}

						$( "#redemptionDisplay" ).append( "<li id='list-"+i+"'><span class='mqparent' id='mqparent-"+i+"'><span class='marquee' id='marquee-"+i+"'>"+data.redemptions[i].redemption_name+"</span></span><button class='redemptionBtn' id='btn-"+i+"' data-redemption='"+data.redemptions[i].id+"' "+btnVal+"> "+data.redemptions[i].cost+"</button></li>" );

						if($("#marquee-"+i).width()>($("#list-"+i).width()*0.8))
						{
							//marquee($("#mqparent-"+i),$("#marquee-"+i));
							$("#marquee-"+i).marquee();

						}
					}
				}
				else if (data.error)
				{

				}
		 });
	}

	function getBalance(callback)
	{
		$.ajax({
				 url: "https://chickenbot.gay/requests/extension/getbalance/"+Twitch.ext.viewer.id,
				 headers: {
	            'Content-Type':'application/json',
							'Authorization':Twitch.ext.viewer.sessionToken
	        }

		 }).then((data)=> {
				if(data)
				{
					userBal = data.points;
					$("#panel-title span#title").text(userBal+" bawks");
					if(callback)
					{
						callback();
					}
				}
				else if (data.error)
				{

				}
		 });
	}
	function redeem(redemption,payload)
	{
		if(Twitch.ext.viewer.id==null)
		{
			$("#mainPanel").html("");
			$( "#mainPanel" ).append("Please allow this extension access to your identity to function correctly.<br/>Without this we will be unable to retrieve your points. <br/><button id='authorizeBtn''>Authorize</button>");

			return;

		}
		$(".popout").remove();
		payload = JSON.stringify(payload);

		$.ajax({
				 url: "https://chickenbot.gay/requests/extension/redeem/"+redemption,
				 type: 'POST',
				 data:payload,
				 headers: {
	            'Content-Type':'application/json',
							'Authorization':Twitch.ext.viewer.sessionToken
	        }

		 }).then((data)=> {
				if(data)
				{
					getBalance(getRedemptions);
				}
				else if (data.error)
				{

				}
		 });
	}

	$("#mainPanel").on("click", "#redemptionBtn", function(){
		if(Twitch.ext.viewer.id==null)
		{
			$("#mainPanel").html("");
			$( "#mainPanel" ).append("Please allow this extension access to your identity to function correctly.<br/>Without this we will be unable to retrieve your points. <br/><button id='authorizeBtn''>Authorize</button>");

			return;

		}
		$("#mainPanel").html("");
		getBalance(getRedemptions);
	});

	$("#closeBtn").click(()=>
	{
		$('.marquee').marquee("stop")
		$("#mainPanel").html("");
		getBalance();
		$( "#mainPanel" ).append( '<ul id="mainOptions"><li class="menuSel" id="redemptionBtn"><p>Redemptions</p></li><li class="menuSel" id="gambleBtn"><p>Gamble</p></li><li class="menuSel" id="bingoBtn"><p>Bingo</p></li><li class="menuSel" id="helpBtn"><p>Help</p></li></ul>' );
	}
	);
	$("#mainPanel").on("click", "#redeemBtn",()=>
	{

		$("#mainPanel").html("");
		$(".popout").remove();
		redeem(redemptionSel);
		getBalance(getRedemptions);

	}
	);

	function getRedemption(redeemId)
	{
		if(Twitch.ext.viewer.id==null)
		{
			$("#mainPanel").html("");
			$( "#mainPanel" ).append("Please allow this extension access to your identity to function correctly.<br/>Without this we will be unable to retrieve your points. <br/><button id='authorizeBtn''>Authorize</button>");

			return;

		}
		$(".popout").remove();
		$("#mainPanel").html("");
		redemptionSel = redeemId;
		$.ajax({
				 url: "https://chickenbot.gay/requests/extension/redemptionSettings/"+redeemId,
				 headers: {
							'Content-Type':'application/json; charset=utf-8',
							'Authorization':Twitch.ext.viewer.sessionToken
					}

		 }).then((data)=> {
				if(data)
				{
					var panel = "<div class='popout'>";
					panel += "<h3>"+data["redemption_name"]+"</h3>";
					if(data["redemption_description"]!=null)
					{
						panel += "<p class='redeemDesc'>"+data["redemption_description"]+"</p>";
					} else
					{
						panel += "<p class='redeemDesc'></p>";
					}

					if(data.hastext==1)
					{
						panel+="<input id='redeemTxt'>";
					}
					panel+="<button class='confirm'"
					if(data["cost"]>userBal)
					{
						panel+="disabled";
					}
					panel+=">"+data["cost"]+"</button>";
					panel+="<button class='cancel'>Cancel</button>";
					panel +="</div>";
					$("#mainPanel").append(panel);
				}
				else if (data.error)
				{

				}
		 });

	}
	$("#mainPanel").on("click", ".popout .confirm", function(){
		payload = {};
		payload.id=redemptionSel;
		if($("#redeemTxt").length>0)
		{
			payload.text = $("#redeemTxt").val();
		}
		redeem(redemptionSel,payload);
	});
	$("#mainPanel").on("click", ".popout .cancel", function(){

		$("#mainPanel").html("");
		getBalance(getRedemptions);

	});
	$( "#mainPanel" ).on( "click", "#start", ()=>{highlow.start()} );
  $( "#mainPanel" ).on( "click", "#higher", ()=>{highlow.guess("high")} );
  $( "#mainPanel" ).on( "click", "#lower", ()=>{highlow.guess("low")} );
  $( "#mainPanel" ).on( "click", "#mainMenu", ()=>{highlow.exit()} );
   var highlow =
  {
    bet:0,
    initialbet:0,
		betmax:100,
    create:function()
    {
      $("#mainPanel").html("");
      var hlInterface = "<div class='hlStart'>";
			if(userBal<this.betmax){
				 this.betmax = userBal;
			 } else
			 {
				 this.betmax = 100;
			 }
			if(userBal < 1)
			{
				$("#mainPanel").append("<p>Unfortunately you do not have enough bawks to gamble. Please come back after you get more!</p><p>You can use the green cross at the top right to return home.</p>");
				return;
			}
      hlInterface += "<input type=number max="+this.betmax+" min=1 id='betval'>";
      hlInterface += "<button id='start'>Start</button>";
      hlInterface +="</div>";

      $( "#mainPanel" ).on( "change", "#betval", function() {
          if($('#betval').val()>100) $('#betval').val(100);
          if($('#betval').val()<1) $('#betval').val(1);
      });
      $("#mainPanel").append(hlInterface);
    },
    start:function()
    {

      if($('#betval').val()>this.betmax) $('#betval').val(this.betmax);
      if($('#betval').val()<1) $('#betval').val(1);
      this.bet = $('#betval').val();
      this.initialbet=this.bet;
      setBalance(userBal-this.bet,getBalance);

      $("#mainPanel").html("");
      var hlInterface = "<div class='hlDiv'>";
      var start = this.randomize();
      this.currentval = start;
      hlInterface += "<button id='higher'>Higher</button>";
      hlInterface += "<p class='nbr' id='currentval'>"+start+"</p>";
      hlInterface += "<button id='lower'>Lower</button>";
      hlInterface += "<p class='statusbar' id='hlStatus'>Your starting bet is: "+this.bet+"</p>";
      hlInterface +="</div>";

      $("#mainPanel").append(hlInterface);

    },
    randomize:function()
    {
			console.log(this.round);
      var max = 87;
      var min = 12;
      var rnd;

      if(this.round==1)
      {
				var tmpmax = 60;
				var tmpmin = 40;
        rnd = Math.round(Math.random() * (tmpmax - tmpmin) + tmpmin);
      }
      else
      {
        var mult= Math.round(
          Math.sqrt(Math.random()*( (max*10) - (min*10) ) * this.currentval*(this.round*2.5))
        );
        rnd = Math.round(Math.random() * (max - min) + min);
        //if(this.currentval>50){ max = mult } else { min=mult }
        var rnd2 = Math.round(Math.random() * (2 - 1) + 1);
        if(rnd2==1){ rnd = rnd+((this.currentval/3))} else { rnd => parseFloat(num.toString().split('').reverse().join('')) * Math.sign(rnd) }
        if(rnd>=100) rnd = Math.round( rnd / ( (this.round+mult)/(Math.sqrt(mult))));
        if(this.currentval>50&&this.currentval>rnd) {  Math.round(Math.random() * (max - min) + min); }
        if(this.currentval<50&&this.currentval<rnd) {  Math.round(Math.random() * (max - min) + min); }

        var rndpicks = [rnd,rnd2+rnd,rnd,Math.round(Math.random() * (max - 1) + 1),Math.round(Math.random() * (min - 1) + 1)];
        rnd = rndpicks[Math.round(Math.random() * (rndpicks.length - 1) + 0)];
        if(rnd<=1){ rnd = Math.round(Math.random() * (max - min) + min); }
        rnd = Math.round(rnd);

      }

      console.log(rnd);
      return rnd;

    },
    guess:function(e)
    {
      this.previous.push(this.currentval);
			this.round++;
      var newval = this.randomize();
      var highlow = "";
      (this.currentval<newval) ?  highlow= "high" : highlow= "low";
      this.currentval = newval;
      var msg;
      if(e==highlow)
      {
      	if(this.round==6)
        {
          this.bet = Math.round(this.bet*1.5);
          this.bet = Math.round(this.bet+(this.initialbet*5));
          $("#higher").prop("disabled",true);
          $("#lower").prop("disabled",true);
          msg = "Congratulations! you have won "+this.bet+"<br/> This game only has a maximum of 5 rounds so return to the main menu to play again!.<button id='mainMenu'>Return</button>";
        }
        else
        {

          this.bet = Math.round(this.bet*1.5);
          msg = "Congratulations! you have won "+this.bet+"<br/> If you want to continue you may click higher or lower again, or click below to return to the main menu.<button id='mainMenu'>Return</button>";

          this.result = "win";
        }
      }
      else
      {
        this.bet = 0;
        this.result = "loss";
        $("#higher").prop("disabled",true);
        $("#lower").prop("disabled",true);

        msg = "Unfortunately you have lost :( Please go back to the main menu to start again!<button id='mainMenu'>Return</button>";
      }
      $("#currentval").html(newval);
      $("#hlStatus").html(msg);

    },
    currentval:0,
    round:1,
    previous:[],
    result:null,
    exit:function()
    {
    	this.round = 1;
    	userBal += this.bet;
      setBalance(userBal,getBalance);
      this.create();
    }
  }
$( "#mainPanel" ).on( "click", "#highorlow", ()=>
                     {
  highlow.create();
} );
$( "#mainPanel" ).on( "click", ".redemptionBtn", (e)=>
{

		var redemptionId = $(e.target).data("redemption");
		getRedemption(redemptionId);

} );
$( "#mainPanel" ).on( "click", "#authorizeBtn", (e)=>
{
	window.Twitch.ext.actions.requestIdShare();
} );

$("#mainPanel").on("click", "#gambleBtn", function(){
	getBalance();
	$("#mainPanel").html("");
	var gambleMenu = "<ul class='gambleOptions'>";
  gambleMenu += "<li id='highorlow' class='gambleOption'><p>Higher or Lower</p></li>";
  gambleMenu += "</ul>";
	$("#mainPanel").append(gambleMenu);
});

$("#mainPanel").on("click", "#bingoBtn", function(){

	$("#mainPanel").html("");
	$("#mainPanel").append("<p>DBD Bingo is a special event that Fowl sometimes runs. <br/> If you would like to take part you can follow his discord for s. </p><br/><p> Use the following commands for more details:<br/> !JoinBingo !HowToPlayBingo !BingoRules</p>");
});
$("#mainPanel").on("click", "#helpBtn", function(){

	$("#mainPanel").html("");
	$("#mainPanel").append("<p>This sction is currently a work in progress! <br/><br/>Check back in a later version for more info!</p>");
});

})();
