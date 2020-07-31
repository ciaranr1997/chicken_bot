redact =
{
	params:[],
	req:{},
	res:{},
	start:function(req,res,reqParams)
	{
		this.params = reqParams;
		this.req = req;
		this.res = res;
		this.run();
	},
	run:async function()
	{
		if(!this.req.user)
		{
			this.error("You are not currently logged in");
			return;
		}
		quoteId = request.params[1];
		let sql = require("../../sql.js");
		sql.connect();
		query = "UPDATE fowl_quotes SET user_id=0 WHERE user_id="+this.req.user.id+" AND id='"+quoteId+"'";

		result = await sql.syncQuery(query).catch(function(err)
		{
				this.error("query failed :(");
				this.res.writeHead(200, {'Content-Type': 'text/json'});
				this.res.end('{"error":"request was a failure updating this quote"}');
				return;

		}).finally(()=>
		{

		});
		console.log(result);
		console.log(query);
		this.end();

	},
	end:function()
	{
		this.res.writeHead(200, {'Content-Type': 'text/json'});
		this.res.end('{"success":"request was successful"}');
	},
	error:function(err)
	{
			this.res.writeHead(200, {'Content-Type': 'text/json'});
			this.res.end('{"error":"'+err+'"}');
	}
};

module.exports=redact;
