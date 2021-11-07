const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');

router.all("*", (req,res, next) => {
	if(!req.user)
	{
		req.session.redirectTo = req.originalUrl;
    res.redirect("/login");
		return;
	}
	else
	{
	 if(req.user.perms==2147483647){
  	next();
	 	}
	 	else
	 	{
			res.redirect("/error");
			return;
		}
	}
})

router.get('/',(req,res)=>{
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();

	fs.readFile('html/admin.html', async (e, data) => {

		html = data.toString();
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${user.image}",req.user.image);

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	});
});

router.get('/quotes',(req,res)=>{
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();

});
router.get('/bingo',(req,res)=>{
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/admin/bingo.html', async (e, data) => {

		html = data.toString();
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${user.image}",req.user.image);
		optionArea = "<div class=\"cardArea\"><table class=\"cards\">";
		optionArea+="<tr><th>Text</th><th>Difficulty</th><th>Actions</th></tr>"
		let sql = require("../../sql.js");
		;
		is_active = await sql.syncQuery("select setting_value from bingo_settings where setting=\"is_active\"");
		is_active = is_active = is_active[0].setting_value;
		if(is_active==1)
		{
			button = '<button class="start open" data-open="true" id="bingo-toggle">Close Bingo!</button>';
		}
		else
		{
				button = '<button class="start closed" data-open="true" id="bingo-toggle">Open Bingo!</button>';
		}

		html = html.replace("${admin.bingo.toggle}",button);
		options = await sql.syncQuery("select * from bingo_options ORDER BY is_active DESC, difficulty ASC,id ASC");
		options.forEach((option, i) => {
			optionArea+="<tr id=\"row-"+option.id+"\"class=\"option"
			if(option.is_active==0) optionArea +=" disabled";
			optionArea+="\">";
			optionArea+="<td><span class=\"optionText\">"+option.card_text+"</span><input id=\"val-"+option.id+"\" hidden value=\""+option.card_text+"\" class=\"valIn\"></td>";
			optionArea+="<td><span class=\"optionDifficulty\">"+option.difficulty+"</span><input type=number hidden id=\"dif-"+option.id+"\" class=\"difInput\" value=\""+option.difficulty+"\"></td>";
			optionArea+="<td><button class=\"edit\" id=\"edit-"+option.id+"\">Edit</button><button class=\"save\" id=\"save-"+option.id+"\">Save</button>";
			optionArea+="<button class=\"disable\" id=\"disable-"+option.id+"\">Disable</button><button class=\"enable\" id=\"enable-"+option.id+"\">Enable</button>";
			optionArea+="<input type='checkbox' class=\"checkSquare\" id=\"check-"+option.id+"\"";
			if(option.is_called)
			{
				optionArea+=" checked ";
			}
			optionArea+=">";
			optionArea+="</td>";
			optionArea+="</tr>";
		});
		optionArea+="<tr class=\"option\" id=\"row-new\"><td><input class=\"valIn\" id=\"val-new\" type=text></td><td><input class=\"difInput\" type=number value=1 min=1 max=3 id=\"dif-new\"></td><td><button class=\"save\" id=\"save-new\">Save</button></td></tr>";
		optionArea+="</table></div>"

		html = html.replace("${admin.bingo.cards}",optionArea);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
		;
	});
});


const config = require("../../config.json");
const { Discord, Intents, Client, MessageCollector} = require('discord.js');
const myIntents = new Intents();
myIntents.add(
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_BANS,
	Intents.FLAGS.GUILD_INVITES,
	Intents.FLAGS.GUILD_VOICE_STATES,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	Intents.FLAGS.DIRECT_MESSAGES
);

const client = new Client({ intents: myIntents, partials:["MESSAGE","REACTION","CHANNEL","USER"] });


client.login(config.token);

router.get('/bingo/cards',(req,res)=>{



	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/admin/cards.html', async (e, data) => {
		let sql = require("../../sql.js");

		checkedQuery = "SELECT * FROM bingo_options";
		checkedArr = await sql.syncQuery(checkedQuery);
		html = data.toString();
		//view as page
		if(req.query.viewas)
		{
			cardQuery = "SELECT * from bingo_cards WHERE is_active=1 AND user_id='"+req.query.viewas+"' ORDER BY ID ASC";
			cards="";
			userCard = await sql.syncQuery(cardQuery);

			if(userCard.length==0)
			{
				cards = "<div class=\"bingo-err\">This user has no bingo card</div>";

			}
			else
			{
				myUser = await client.users.fetch(userCard[0].user_id);
				userName = myUser.username+"#"+myUser.discriminator
				cards+="<p class=\"user-title\">"+userName+" ($TOTAL) ["+userCard.created+"]</p>";
				cards+="<div class=\"board\">"
				all = JSON.parse(userCard[0].card_data);
				total=0;
				for(i=0; i<all.length;i++)
				{
					//check if the square has been checked off
					id= all[i].id;
					dif = "";
					//checked = await sql.syncQuery("select is_called from bingo_options where id='"+id+"'");
					//checked = checked[0].is_called;
					//checked = allCards.find(o => o.id === id).is_called;
					if(all[i].difficulty==1) dif = "easy"
					if(all[i].difficulty==2) dif = "medium"
					if(all[i].difficulty==3) dif = "hard"
					checked = checked = checkedArr.find(x => x.id === id).is_called;

					cards+='<div class="tile  ';
					if(checked)
					{
						cards+="checked "
						total++;
					}
					cards+= dif+'" id="card-'+id+'">';
					cards+='<span class="bingo-text">';
					cards+=all[i].card_text;
					cards+='</span>'
					cards+="</div>"

				}
				cards +="</div>";
				cards = cards.replace("$TOTAL",total);
				cards +='<script src="/static/js/confetti.min.js"></script><script src="/static/js/bingo.js"></script><audio id="clapping"><source src="/static/sound/clapping.mp3" type="audio/ogg" volume="0.2">Your browser does not support the audio element.</audio>';
				cards +='<link rel="stylesheet" href="/static/css/bingo.css">';
			}

		}
		else
		{//normal bingo page

			cardQuery = "SELECT * from bingo_cards WHERE is_active=1 ORDER BY ID ASC";
			cards="";

			result = await sql.syncQuery(cardQuery);
			if(result.length>0)
			{

				data = [];
				for(u=0;u<result.length;u++)
				{
					userCard = "";
					data[u] = {};
					total = 0;
					card = result[u];
					card_data = JSON.parse(card.card_data);
					myUser = await client.users.fetch(card.user_id);
					userName = myUser.username+"#"+myUser.discriminator
					userCard+="<p class=\"user-title\">"+userName+" ($TOTAL) ["+card.created+"]</p>";
					userCard+="<div class=\"board\">"
					for(i=0; i<card_data.length;i++)
					{
						//check if the square has been checked off

						id= card_data[i].id;
						dif = "";
						if(card_data[i].difficulty==1) dif = "easy"
						if(card_data[i].difficulty==2) dif = "medium"
						if(card_data[i].difficulty==3) dif = "hard"
						checked = checkedArr.find(x => x.id === id).is_called;
						userCard+='<div class="tile  ';
						if(checked)
						{
							userCard+="checked ";
							total++;
						}
						userCard+= dif+' card-'+id+'">';
						userCard+='<span class="bingo-text">';
						userCard+=card_data[i].card_text;
						userCard+='</span>'
						userCard+="</div>"
					}
					userCard+="</div>";
					userCard = userCard.replace("$TOTAL",total);

					data[u] = {total:total, card:userCard, user:myUser};

				}
				data = data.sort(function(a,b){
				    return b.total - a.total;
			  });
				cards = "";
				data.forEach(function(element)
				{
					cards+=element.card
				})

			}
			else
			{
				cards = "<div class=\"bingo-err\">Nobody has any bingo cards yet</div>";
			}

		}

		html = html.replace("${bingo.cards}",cards);
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${user.image}",req.user.image);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);

	});
});

router.get('/twitch',(req,res)=>{
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();

	fs.readFile('html/admin/twitch.html', async (e, data) => {

		html = data.toString();
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${user.image}",req.user.image);

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	});
});





router.get('/redemptions',(req,res)=>{
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/admin/redemptionman.html', async (e, data) => {

		html = data.toString();
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${user.image}",req.user.image);
		redemptionArea = "<div class=\"redemptionArea\"><table class=\"redemptions\">";
		redemptionArea+="<tr><th>Redemption Name</th><th>Description</th><th>Cost</th><th>Video URL</th><th>Image URL</th><th>Audio URL</th><th>Allow Text?</th><th>Allow TTS?</th><th>Actions</th></tr>"
		let sql = require("../../sql.js");


		redemptions = await sql.syncQuery("select * from fowl_redemptions WHERE isdeleted=0 ORDER BY isenabled DESC, redemption_name ASC ");
		redemptions.forEach((redemption, i) => {
			redemptionArea+="<tr id=\"row-"+redemption.id+"\"class=\"option"
			if(redemption.isenabled==0) redemptionArea +=" disabled";
			redemptionArea+="\">";
			redemptionArea+="<td><span class=\"redemptionName\">"+redemption.redemption_name+"</span></td>";
			redemptionArea+="<td><span class=\"redemptionDescription\">"+redemption.redemption_description+"</span></td>";
			redemptionArea+="<td><span class=\"redemptionCost\">"+redemption.cost+"</span></td>";
			redemptionArea+="<td><span class=\"redemptionVideo\">"+redemption.videourl+"</span></td>";
			redemptionArea+="<td><span class=\"redemptionImage\">"+redemption.imageurl+"</span></td>";
			redemptionArea+="<td><span class=\"redemptionaudio\">"+redemption.audiourl+"</span></td>";
			var txt = "";
			if(redemption.hastext==1)
			{
				txt="yes";
			}
			else
			{
				txt="no";
			}
			var tts = "";
			if(redemption.allowtts==1)
			{
				tts="yes";
			}
			else
			{
				tts="no";
			}
			redemptionArea+="<td><span class=\"redemptionText\">"+txt+"</span></td>";
			redemptionArea+="<td><span class=\"redemptionTts\">"+tts+"</span></td>";

			redemptionArea+="<td><button class=\"edit\" id=\"edit-"+redemption.id+"\">Edit</button>";
			redemptionArea+="<button class=\"disable\" id=\"disable-"+redemption.id+"\">Disable</button><button class=\"enable\" id=\"enable-"+redemption.id+"\">Enable</button><button class=\"delete\" id=\"delete-"+redemption.id+"\">Delete</button>";

			redemptionArea+="</td>";
			redemptionArea+="</tr>";
		});
		redemptionArea+="</table></div>";

		html = html.replace("${admin.redemptions}",redemptionArea);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);

	});
});

router.get('/redemptionqueue',(req,res)=>{
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/admin/extension.html', async (e, data) => {
		let sql = require("../../sql.js");

		queueQuery = "SELECT fowl_redemptions.redemption_name, redemption_queue.username, redemption_queue.timestamp, redemption_queue.text FROM redemption_queue INNER JOIN fowl_redemptions ON redemption_queue.redemptionid = fowl_redemptions.id ORDER by redemption_queue.id DESC LIMIT 25;";
		queueArr = await sql.syncQuery(queueQuery);
		html = data.toString();
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${user.image}",req.user.image);
		var recentRedemptions = "<table class='redemptionList'>";
		recentRedemptions+="<tr><th>Redemption Name</th><th>userName</th><th>Redemption Text</th><th>Redemption Time</th>";
		for(i=0;i<queueArr.length;i++)
		{
			var newDate = new Date(parseInt(queueArr[i]["timestamp"]));
			var hh = newDate.getHours();
			var mm = newDate.getMinutes();
			if(hh<10)
			{
				hh= "0"+hh;
			}
			if(mm<10)
			{
				mm= "0"+mm;
			}
			var redemptionDate = hh + ":" + mm +" " +newDate.getDate()+"/"+(newDate.getMonth()+1)+"/"+newDate.getFullYear();

			recentRedemptions+="<tr><td>"+queueArr[i]["redemption_name"]+"</td><td>"+queueArr[i]["username"]+"</td><td>"+queueArr[i]["text"]+"</td><td>"+redemptionDate+"</td></tr>"

		}
		recentRedemptions+="</table>"
		html = html.replace("${admin.extension.redemptions}",recentRedemptions);

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	});
});
router.get('/upload',(req,res)=>{
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/admin/fileupload.html', async (e, data) => {

		html = data.toString();
		html = html.replace("${site.header}",header);


		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	});
});

router.get('/loyaltypoints',(req,res)=>{
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/admin/loyalty.html', async (e, data) => {

		html = data.toString();
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${user.image}",req.user.image);
		loyaltyTable = "<div class=\"pointContainer\"><table class=\"points tablesorter\">";
		loyaltyTable+="<thead><tr><th>User ID</th><th>Username</th><th>Points</th>"
		if(req.user.id =="267071563285659659" ||req.user.id =="187262396237217792" )
		{
			loyaltyTable += "<th>Actions</th>";
		}
		loyaltyTable+= "</tr></thead><tbody>"
		let sql = require("../../sql.js");
		var twitch = require("../../twitch.js");
		var util = require("../../utils.js");
		rows = await sql.syncQuery("select fowl_loyalty.user_id,fowl_loyalty.points from fowl_loyalty order by points DESC");

		idarr = [];

		for(i=0;i<rows.length;i++)
		{
			idarr.push(rows[i].user_id);
		}
		user_details = await twitch.getUserDetailsBulk(idarr);
		for(i=0;i<user_details.length;i++)
		{
			index = utils.keySearch(user_details[i].id, rows,"user_id");
			if(index>=0)
			{
				rows[index].user_details=user_details[i];
			}
		}
		for(i=0;i<rows.length;i++)
		{
			if(rows[i].user_details==undefined)
			{
				username=rows[i].user_id;
			}
			else
			{
				username = rows[i].user_details.display_name;
			}
			loyaltyTable+="<tr>";
			loyaltyTable+="<td>"+rows[i].user_id+"</td>";
			loyaltyTable+="<td>"+username+"</td>";
			loyaltyTable+="<td id='points-"+rows[i].user_id+"'>"+rows[i].points+"</td>";
			if(req.user.id =="267071563285659659" ||req.user.id =="187262396237217792" )
			{
				loyaltyTable += "<td><button style='width:100px;' class='btnAdd' id='addPnts-"+rows[i].user_id+"'>Add points:</button><input type='number' style='width:80px;' id='addInput-"+rows[i].user_id+"' style='width:80px'><br/><button style='width:100px;' class='setBtn' id='setPnts-"+rows[i].user_id+"'>Set points:</button><input type='number' id='setInput-"+rows[i].user_id+"' style='width:80px'></td>";
			}
			loyaltyTable+="</tr>";
		}
		loyaltyTable+="</tbody></table>";

		html = html.replace("${admin.loyalty}",loyaltyTable);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);

	});
});


module.exports = router;
