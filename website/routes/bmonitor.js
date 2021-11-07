const router = require('express').Router();
const fs = require('fs');

router.get('/bingo',(req,res)=>
{

	fs.readFile('html/bingomonitor.html', async (e, data) =>
	{
		html = data.toString();

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);

	});



});
module.exports = router;
