const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');
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


router.get('/twitch', async function(req,res){


	//get rank
	let sql = require("../../sql.js");
	var twitch = require("../../twitch.js");
	var util = require("../../utils.js");
	rows = await sql.syncQuery("select twitch_watchtime.user_id,timer,message_count from twitch_watchtime inner join twitch_messages ON twitch_watchtime.user_id = twitch_messages.user_id order by twitch_watchtime.timer desc");
	html = fs.readFileSync("html/twitch_leaders.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	nav = fs.readFileSync("pageparts/nav.html").toString();
	html = html.replace("${site.nav}",nav);
	html = html.replace("${user.image}",req.user.image);
	html = html.replace("${site.header}",header);
	leaderTable = "<table class='tablesorter' id='twitchLeaderboard'><thead><tr><th>Position</th><th>Name</th><th>Total Watchtime</th><th>Messages Sent</th></tr></thead><tbody>";
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
		leaderTable+="<tr>";
		leaderTable+="<td>"+(i+1)+"</td>";
		leaderTable+="<td>"+username+"</td>";
		leaderTable+="<td>"+util.secondsToDhms(rows[i].timer)+"</td>";
		leaderTable+="<td>"+rows[i].message_count+"</td>";
		leaderTable+="</tr>";
	}
	leaderTable+="</tbody></table>";

	html = html.replace("${leaderboard.twitch}",leaderTable);

	res.writeHead(200, { 'Content-Type': 'text/html' });
	res.end(html);

});

router.get('/', async function(req,res){
	/*let sql = require("../../sql.js");
	;
	rows = await sql.syncQuery("select * from fowl_levels order by points desc");

	header = fs.readFileSync("pageparts/header.html").toString();
	var leaders = "<ul>"
	for(i=0; i<rows.length;i++)
	{

		var user = rows[i].user_id;
		var points = rows[i].points;
		var rank = i+1;
		myUser = await client.users.fetch(user);
		leaders +="<li class='leaderrow'>";
		image = 'http://cdn.discordapp.com/avatars/'+myUser.id+'/'+myUser.avatar+'.png'
		leaders += "<img src='"+image+"'/>";
		leaders += "<span class='leadertext'>";
		leaders += "<p class='leadername'>"
		leaders += myUser.username+"#"+myUser.discriminator;
		leaders += "</p>"
		leaders += "<p class='leaderscore'>"
		leaders += "Rank #"+rank+" ("+points+" xp)"
		leaders += "</p>"
		leaders += "</span>";
		leaders += "</li>";
	}
	leaders +="</ul>"
	fs.readFile('html/leaderboard.html', async (e, data) => {
		if (e) throw e;


		html = data.toString();
		if(req.user)
		{

	  } else
		{
			nav = "";
			html = html.replace("${site.nav}",nav);
		}*/

		html = "test"//html.replace("${leaderboard.leaders}","leaders");

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	//});
});
module.exports = router;
client.on('ready', () => {
	loggedIn = true;
});
