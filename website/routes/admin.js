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
		optionArea+="<tr><th>Text</th><th>Difficulty</th><th>Actions</th>"
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
const Discord = require('discord.js');
const client = new Discord.Client();
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
				cards+="<p class=\"user-title\">"+userName+" ($TOTAL)</p>";
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
					userCard+="<p class=\"user-title\">"+userName+" ($TOTAL)</p>";
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
		;
	});
});

module.exports = router;
