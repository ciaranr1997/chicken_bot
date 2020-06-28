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
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	user = req.params[0].replace(".png","");
	console.log(user);
	myUser = await client.users.fetch(user);
	console.log(myUser);
	ctx.font = '20px Impact'
	ctx.fillStyle = "white";
	ctx.fillText(myUser.username+"#"+myUser.discriminator, 100, 30)
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
