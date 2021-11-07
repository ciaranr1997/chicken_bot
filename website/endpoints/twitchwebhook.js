const bodyParser = require('body-parser');
const express = require('express');
const router = require('express').Router();
const fs = require('fs');
var crypto = require('crypto');
const config = require("../../config.json");


router.use(express.json());       // to support JSON-encoded bodies
router.use(express.urlencoded());


// Create a client with our options




router.get('/',(req,res)=>{

		console.log("GET");
		console.log(req.body);

		console.log(req.headers);
		res.writeHead(200, {'Content-Type': 'text/html'});
});
router.post('/',async (req,res)=>{
		let sql = require("../../sql.js");
		console.log("POST");
		headers = req.headers;
		var message = req.header("Twitch-Eventsub-Message-Id")+req.header("Twitch-Eventsub-Message-Timestamp")+req.rawBody;
		var msgId = req.header("Twitch-Eventsub-Message-Id");
		var dupcheck = await sql.syncQuery("SELECT * from twitch_events where id='"+msgId+"'");
		if(dupcheck.length>0)
		{
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end("done");
			return;

		}
		sql.run("INSERT INTO twitch_events (id) VALUES ('"+msgId+"')");
		var signature = req.header("Twitch-Eventsub-Message-Signature");
		var hash = crypto.createHmac('SHA256', config.twitch.event_secret).update(message).digest('hex');;
		hash= "sha256="+hash;
		if(hash!=signature)
		{
			res.status(403).send("Forbidden");
			return;
		}


		var data = req.body;
		console.log(data);
		var evtType = data.subscription.type;
		var user_id= data.event.user_id;
		if(evtType=="channel.raid")
		{
				tmiClient = req.app.get("tmiClient");;
				user_id=data.event.from_broadcaster_user_id;
				tmiClient.say("#fowl_play_gaming","!so @"+data.event.from_broadcaster_user_name);
				setTimeout(()=>{
						tmiClient.say("#fowl_play_gaming","!so @"+data.event.from_broadcaster_user_name);
				}, 60000);

		}
		var getVal = await sql.syncQuery("SELECT * FROM loyalty_settings WHERE setting_key='"+evtType+"'");
		if(getVal.length<1)
		{
			console.log("invalid request");
			return;
		}
		var pointsForEvt = getVal[0].value;
		if(evtType=="channel.cheer")
		{
			pointsForEvt = pointsForEvt*data.event.bits;
		} else if(evtType=="channel.subscription.gift")
		{
			pointsForEvt = pointsForEvt*data.event.total*(data.event.tier/1000);
		} else if(evtType=="channel.subscription"||evtType=="channel.subscription.message")
		{
			pointsForEvt = pointsForEvt*(data.event.tier/1000);
		}
		console.log("Points: " +pointsForEvt);
		var query = "INSERT INTO  fowl_loyalty (user_id,points) VALUES(\""+user_id+"\","+pointsForEvt+") ON DUPLICATE KEY UPDATE points=points+"+pointsForEvt;
		sql.run(
			query
		);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(req.body.challenge);
});
router.all('/',(req,res)=>{

	console.log(req.body);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end("Non standard traffic");
});
module.exports = router;
