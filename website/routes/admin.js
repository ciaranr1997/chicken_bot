const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');


router.all("*", (req,res, next) => {
	if(!req.user)
	{
		req.session.redirectTo = req.originalUrl;
    res.redirect("/login");
		return;
	}
	else
	{
	 if(req.user.perms==2147483647){
  	next();
	 	}
	 	else
	 	{
			console.log("user");
			console.log(req.user)
			res.redirect("/error");
			return;
		}
	}
})

router.get('/',(req,res)=>{
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();

	fs.readFile('html/admin.html', async (e, data) => {

		html = data.toString();
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${user.image}",req.user.image);

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	});
});

router.get('/quotes',(req,res)=>{
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();

});
router.get('/bingo',(req,res)=>{
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/admin/bingo.html', async (e, data) => {

		html = data.toString();
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${user.image}",req.user.image);
		optionArea = "<div class=\"cardArea\"><table class=\"cards\">";
		optionArea+="<tr><th>Text</th><th>Difficulty</th><th>Actions</th>"
		let sql = require("../../sql.js");
		sql.connect();
		is_active = await sql.syncQuery("select setting_value from bingo_settings where setting=\"is_active\"");
		is_active = is_active = is_active[0].setting_value;
		if(is_active==1)
		{
			button = '<button class="start open" data-open="true" id="bingo-toggle">Close Bingo!</button>';
		}
		else
		{
				button = '<button class="start closed" data-open="true" id="bingo-toggle">Open Bingo!</button>';
		}

		html = html.replace("${admin.bingo.toggle}",button);
		options = await sql.syncQuery("select * from bingo_options ORDER BY is_active DESC, difficulty ASC,id ASC");
		options.forEach((option, i) => {
			optionArea+="<tr id=\"row-"+option.id+"\"class=\"option"
			if(option.is_active==0) optionArea +=" disabled";
			optionArea+="\">";
			optionArea+="<td><span class=\"optionText\">"+option.card_text+"</span><input id=\"val-"+option.id+"\" hidden value=\""+option.card_text+"\" class=\"valIn\"></td>";
			optionArea+="<td><span class=\"optionDifficulty\">"+option.difficulty+"</span><input type=number hidden id=\"dif-"+option.id+"\" class=\"difInput\" value=\""+option.difficulty+"\"></td>";
			optionArea+="<td><button class=\"edit\" id=\"edit-"+option.id+"\">Edit</button><button class=\"save\" id=\"save-"+option.id+"\">Save</button>";
			optionArea+="<button class=\"disable\" id=\"disable-"+option.id+"\">Disable</button><button class=\"enable\" id=\"enable-"+option.id+"\">Enable</button>";
			optionArea+="</td>";
			optionArea+="</tr>";
		});
		optionArea+="<tr class=\"option\" id=\"row-new\"><td><input class=\"valIn\" id=\"val-new\" type=text></td><td><input class=\"difInput\" type=number value=1 min=1 max=3 id=\"dif-new\"></td><td><button class=\"save\" id=\"save-new\">Save</button></td></tr>";
		optionArea+="</table></div>"

		html = html.replace("${admin.bingo.cards}",optionArea);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	});
});



router.get('/bingo/cards',(req,res)=>{
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/admin/cards.html', async (e, data) => {
		cardQuery = "SELECT * from bingo_cards WHERE is_active=1 ORDER BY ID DESC"
		cards="";
		html = html.replace("${admin.bingo.cards}",cards);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	});
});

module.exports = router;
