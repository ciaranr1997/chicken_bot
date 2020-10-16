const express = require('express');
const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');
const bodyParser = require('body-parser')
router.use(express.json());       // to support JSON-encoded bodies
router.use(express.urlencoded()); // to support URL-encoded bodies
router.get('[a-zA-Z0-9\/]*', async function(req,res){
	params = req.params[0].split('/');
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
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end();
});
router.post('[a-zA-Z0-9\/]*', async function(req,res){
	params = req.params[0].split('/');
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

module.exports = router;
