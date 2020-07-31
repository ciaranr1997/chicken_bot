const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');


router.get('[a-zA-Z0-9\/]*', async function(req,res){
	console.log(req.params);
	params = req.params[0].split('/');
	console.log(params);
	request = params[0];
	//
	path = "./requests/"+request+".js";
	if(fs.existsSync(path))
	{
		request = require(path);
		request.start(req,res,params);
	}
	else
	{
		console.log("path not found");
	}
});

router.get('/',(req,res)=>{
	console.log(req.params);
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end();
});

module.exports = router;
