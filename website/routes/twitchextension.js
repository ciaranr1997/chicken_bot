const router = require('express').Router();
const fs = require('fs');
const config = require("../../config.json");
const url = require('url');


router.get('/', async function(req,res){



});
router.get('/panel.html', async function(req,res){
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/twitchextension/panel.html', (e, data) => {
		if (e) throw e;

		res.writeHead(200, {'Content-Type': 'text/html'});
		html = data.toString();
		html = html.replace("${site.header}",header);
		res.end(html);
	})

});
router.get('/mobile.html', async function(req,res){
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/twitchextension/mobile.html', (e, data) => {
		if (e) throw e;

		res.writeHead(200, {'Content-Type': 'text/html'});
		html = data.toString();
		html = html.replace("${site.header}",header);
		res.end(html);
	})

});
router.get('/video_component.html', async function(req,res){
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/twitchextension/panel.html', (e, data) => {
		if (e) throw e;

		res.writeHead(200, {'Content-Type': 'text/html'});
		html = data.toString();
		html = html.replace("${site.header}",header);
		res.end(html);
	})

});


router.get('/video_overlay.html', async function(req,res){
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/twitchextension/panel.html', (e, data) => {
		if (e) throw e;

		res.writeHead(200, {'Content-Type': 'text/html'});
		html = data.toString();
		html = html.replace("${site.header}",header);
		res.end(html);
	})

});


module.exports = router;
