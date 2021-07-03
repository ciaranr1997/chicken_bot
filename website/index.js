const fs = require('fs');
var https = require('https');
const express = require('express');
const app = express();
app.enable('trust proxy',["127.0.0.1:8001","127.0.0.1","http://localhost:8001","http://localhost"]);
const session = require("express-session");
const passport = require("passport");
const authRoute = require('./routes/auth');
const bingoRoute = require('./routes/bingo');
const scoreRoute = require('./routes/scorecard');
const quoteRoute = require('./routes/quotes');
const adminRoute = require('./routes/admin');
const leaderRoute = require('./routes/leaderboard');
const twitchRoute = require('./routes/twitch');
const userRoute = require('./routes/user');
const testRoute = require('./routes/testing');
const requestRoute = require('./requests');
const DiscordStrategy = require('./strategies/discordstrategy.js');
const config = require('../config.json');
var test = "test";


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

//IMPORTANT PAGES - these can ignore the auth redirect

app.use('/scorecard',scoreRoute);
app.use('/static', express.static('assets'))
app.use('/auth',authRoute);
app.use('/admin',adminRoute);
app.use('/requests',requestRoute);
app.use('/tests',testRoute);


app.get('/error', (req, res) => {
	fs.readFile('html/error.html', (e, data) => {
    if (e) throw e;

		res.writeHead(404, {'Content-Type': 'text/html'});

		header = fs.readFileSync("pageparts/header.html").toString();
		html = data.toString();
		html = html.replace("${site.header}",header);

	  res.end(html);
	});
});


app.get('/login', (req, res) => {
	if(req.hostname!="localhost"&&req.hostname!="chickenbot.xyz")
	{
		process.env.protocol = "https";
	} else
	{
		process.env.protocol = "http";
	}
	process.env.host = req.hostname;
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/login.html', (e, data) => {
		if (e) throw e;

		res.writeHead(200, {'Content-Type': 'text/html'});
		html = data.toString();
		html = html.replace("${site.header}",header);
		res.end(html);
	});
});

app.all("*", (req,res, next) => {
	if(req.hostname!="localhost"&&req.hostname!="chickenbot.xyz")
	{
		process.env.protocol = "https";
	} else
	{
		process.env.protocol = "http";
	}
	process.env.protocol = req.hostname;
 if(req.user){
  next();
 }else{
	 	req.session.redirectTo = req.originalUrl;
    res.redirect("/login");
  }
})


//pages
app.get('/', (req, res) => {
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	if(req.user)
	{
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
		res.redirect("/login");
	}
});

app.get('/sql',async (req, res) => {
	let sql = require("../sql.js");
	;
	result = await sql.syncQuery("select * from fowl_quotes");
	;
	res.send(result);
});



//Non important routes
app.use('/twitch',twitchRoute);

app.use('/bingo',bingoRoute);

app.use('/user',userRoute);

app.use('/quotes',quoteRoute);

app.use('/leaderboard',leaderRoute);



const server = app.listen(8001, () => {
  console.log(`Express running → PORT ${server.address().port}`);
	var twitch = require("../twitch.js");
	twitch.getToken();

	//twitch.checkToken(process.env.twitch);
});

//https.createServer(options, app).listen(3443);
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});


//ERROR Handling
app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
		res.redirect('/error');
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});
