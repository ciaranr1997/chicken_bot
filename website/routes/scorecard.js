const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("../../config.json");
const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(400, 100)
const ctx = canvas.getContext('2d')

client.login(config.token);

router.get('/[x0-9]*', async function(req,res){
	user = req.params[0].replace(".png","");
	//get rank
	let sql = require("../../sql.js");
	sql.connect();
	rows = await sql.syncQuery("select * from fowl_levels order by points desc");
	sql.close();
	rank = 0;
	for(i=0;i<rows.length;i++)
	{
		if(rows[i].user_id==user)
		{
			rank = i+1;
			points = rows[i].points;
			break;
		}
	}
	if(rank==0)
	{

		return;
	}

	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	myUser = await client.users.fetch(user);
	ctx.font = '20px Impact'
	ctx.fillStyle = "white";
	ctx.fillText(myUser.username+"#"+myUser.discriminator, 100, 50)
	ctx.fillText("Rank #"+rank+" ("+points+" xp)",100,70);
	// Draw line under text
	res.writeHead(200, { 'Content-Type': 'image/png' });

	image = await loadImage('http://cdn.discordapp.com/avatars/'+myUser.id+'/'+myUser.avatar+'.png');
	ctx.drawImage(image, 25, 25, 50, 50)

	ctx.beginPath();
	ctx.arc(50, 50, 32, 0, 2 * Math.PI);
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 10;
	ctx.stroke();

	res.end(canvas.toBuffer());

});

module.exports = router;
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	loggedIn = true;
});
