const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');


router.all("*", (req,res, next) => {
	if(!req.user)
	{

    res.redirect("/error");
		return;
	}
	if(req.user.perms==2147483647){
  	next();
 	}
 	else
 	{
		res.redirect("/error");
		return;
	}
})

router.get('/',(req,res)=>{
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

});

module.exports = router;
