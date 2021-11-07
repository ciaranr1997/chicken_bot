const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(400, 100)
const ctx = canvas.getContext('2d')
const config = require("../../config.json");

//channel =
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


router.get('/[x0-9]*', async function(req,res){
	user = req.params[0].replace(".png","");
	//get rank
	let sql = require("../../sql.js");
	;
	rows = await sql.syncQuery("select * from fowl_levels order by points desc");
	;
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
