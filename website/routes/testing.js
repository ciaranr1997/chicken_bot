const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');
const config = require("../../config.json");

router.get('/sql',async (req,res)=>{
		html = "";
		let sql = require("../../new-sql.js");
		//output = await sql.syncQuery("SELECT * FROM bingo_options");
		sql.query("SELECT * FROM bingo_options where id=?",test,[1]);
		//console.log(output);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);

});
function test(data)
{
	console.log(data);
}
module.exports = router;
