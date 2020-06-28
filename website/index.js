const fs = require('fs');

const express = require('express');
const app = express();
const session = require("express-session");
const passport = require("passport");
const authRoute = require('./routes/auth');
const bingoRoute = require('./routes/bingo');
const scoreRoute = require('./routes/scorecard');
const DiscordStrategy = require('./strategies/discordstrategy.js');
const config = require('../config.json');

app.use(passport.initialize());
app.use(passport.session());
app.use(require('cookie-parser')());
app.use(session({
	secret: config.web_secret,
	cookie: {
		maxAge: 60000*60*24
	},
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/static', express.static('assets'))

app.get('/', (req, res) => {
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	if(req.user)
	{
		//load page parts
		console.log("user exists");

		console.log(req.user.id);
		fs.readFile('html/default.html', (e, data) => {
	    if (e) throw e;

		  res.writeHead(200, {'Content-Type': 'text/html'});
			html = data.toString();
			html = html.replace("${site.header}",header);
			html = html.replace("${site.nav}",nav);
			html = html.replace("${user.image}",req.user.image);

		  res.end(html);
		});
	} else
	{
		fs.readFile('html/login.html', (e, data) => {
	    if (e) throw e;

		  res.writeHead(200, {'Content-Type': 'text/html'});
			html = data.toString();
			html = html.replace("${site.header}",header);
			res.end(html);
		});
	}
});

app.use('/auth',authRoute);
app.use('/bingo',bingoRoute);
app.use('/scorecard',scoreRoute);

const server = app.listen(8001, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
