const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("../../config.json");
const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(400, 400)
const ctx = canvas.getContext('2d')

client.login(config.token);

router.get('/img', async function(req,res){


	//get rank
	let sql = require("../../sql.js");
	sql.connect();
	rows = await sql.syncQuery("select * from fowl_levels order by points desc LIMIT 5");
	sql.close();
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	rank = 0;
	for(i=0;i<rows.length;i++)
	{
		var u = i;
		var user = rows[i].user_id;
		var points = rows[i].points;
		rank = i+1;
		myUser = await client.users.fetch(user);
		ctx.font = '20px Impact'
		ctx.fillStyle = "white";
		ctx.fillText(myUser.username+"#"+myUser.discriminator, 100, 50+(u*70))
		ctx.fillText("Rank #"+rank+" ("+points+" xp)",100,70+(u*70));
		// Draw line under text



		ctx.drawImage(image, 25, 25+(u*70), 50, 50)

		ctx.beginPath();
		ctx.arc(50, 50+(u*70), 30, 0, 2 * Math.PI);
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 15;
		ctx.stroke();
	}


	res.writeHead(200, { 'Content-Type': 'image/png' });
	res.end(canvas.toBuffer());

});

router.get('/', async function(req,res){
	let sql = require("../../sql.js");
	sql.connect();
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
			nav = fs.readFileSync("pageparts/nav.html").toString();
			html = html.replace("${site.nav}",nav);
			html = html.replace("${user.image}",req.user.image);
	  } else
		{
			nav = "";
			html = html.replace("${site.nav}",nav);
		}
		html = html.replace("${site.header}",header);
		html = html.replace("${leaderboard.leaders}",leaders);

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	});
});
module.exports = router;
client.on('ready', () => {
	loggedIn = true;
});
