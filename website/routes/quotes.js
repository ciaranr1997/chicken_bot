const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');


router.get('/',(req,res)=>{
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/quotes.html', async (e, data) => {
		let sql = require("../../sql.js");
		sql.connect();
		quoteList = await sql.syncQuery("select * from fowl_quotes where user_id='189514636318605313'");
		sql.close();
		output = "";
		for(i=0;i<quoteList.length;i++)
		{
			output+="<li class=\"\">";
			output+="<span class=\"quote\">";
			output+=quoteList[i].quote;
			output+="</span>";
			output+="<button class=\"redactbtn\" id=\"redact-"+quoteList.id+"\">REDACT</button>";
			output+="</li>"
		}
		console.log(quoteList);
		html = data.toString();
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${quotes.list}",output);
		html = html.replace("${user.image}",req.user.image);

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	});
});
module.exports = router;
