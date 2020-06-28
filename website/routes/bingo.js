const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');


router.get('/',(req,res)=>{
	if(!req.user)
	{
		res.redirect('/');
	}
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/bingo.html', (e, data) => {
		if (e) throw e;

		res.writeHead(200, {'Content-Type': 'text/html'});
		html = data.toString();
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${user.image}",req.user.image);

		res.end(html);
	});
});

module.exports = router;
