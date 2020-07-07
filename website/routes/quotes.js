const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');


router.get('/',(req,res)=>{
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/quotes.html', async (e, data) => {
		let sql = require("../../sql.js");
		sql.connect();
		quoteList = await sql.syncQuery("select * from fowl_quotes where user_id='"+user.id+"'");
		sql.close();
		console.log(quoteList);
		html = data.toString();
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${user.image}",req.user.image);

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	});
});
module.exports = router;
