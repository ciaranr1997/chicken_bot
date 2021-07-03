const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');
const config = require("../../config.json");
const url = require('url');


router.get('/', async function(req,res){

	let sql = require("../../sql.js");
	connections = await sql.syncQuery("select * from connections where user_id='"+req.user.id+"' AND service='twitch'");
	if(connections.length>0)
	{
		res.redirect("/user?msg=already connected twitch");
	}
	else
	{
		res.redirect("https://id.twitch.tv/oauth2/authorize?client_id="+config.twitch.client_id+"&response_type=code&scope=user:read:subscriptions&redirect_uri="+process.env.protocol	+"://"+req.headers.host+config.twitch.redirect_uri);
	}

});
router.get('/verify', async function(req,res){

	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var code = query.code;


	var twitch = require("../../twitch.js");
	redir = process.env.protocol+"://"+req.headers.host+config.twitch.redirect_uri;
	var auth = await twitch.getAuth(code,redir);
	authCode = auth.access_token;
	var userData = await twitch.checkToken(authCode);
	let sql = require("../../sql.js");
	await sql.run("INSERT INTO connections (service,user_id,connected_id,date_connected) VALUES(?,?,?,?)",["twitch",req.user.id,userData.user_id,Date.now()]);
	res.redirect("/user");
});

module.exports = router;
