const router = require('express').Router();
const fs = require('fs');

router.get('*',(req,res)=>
{

	fs.readFile('html/guessmonitor.html', async (e, data) =>
	{
		html = data.toString();

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);

	});



});
module.exports = router;
