const fs = require('fs');
admin =
{
	params:[],
	req:{},
	res:{},
	start:function(req,res,reqParams)
	{
		this.params = reqParams;
		this.req = req;
		this.res = res;
		body = req.body
		this.run();
	},
	run:async function()
	{
		if(!this.req.user)
		{
			this.error("You are not currently logged in");
			return;
		}
		if(this.req.user.perms!=2147483647)
		{
			this.error("You are not currently logged in as an admin");
			return;
		}

		let sql = require("../../sql.js");
		var user_id = body.user_id;
		if(params[1]=="add")
		{
			var addVal = body.addBal
			var query = "UPDATE fowl_loyalty set points=points+"+addVal+" WHERE user_id="+user_id;

			await sql.syncQuery(query);
			var updateArr = await sql.syncQuery("SELECT points FROM fowl_loyalty WHERE user_id="+user_id);
			var updBal = updateArr[0].points;
			this.res.writeHead(200, {'Content-Type': 'text/json'});
			this.res.end('{"success":"request was successful","newBal":'+updBal+'}');
			return;

		} else if(params[1]=="set")
		{
			var newBal = body.setBal

			var query = "UPDATE fowl_loyalty set points="+newBal+" WHERE user_id="+user_id;
			var res = await sql.syncQuery(query);
			var updateArr = await sql.syncQuery("SELECT points FROM fowl_loyalty WHERE user_id="+user_id);
			var updBal = updateArr[0].points;
			this.res.writeHead(200, {'Content-Type': 'text/json'});
			this.res.end('{"success":"request was successful","newBal":'+updBal+'}');
			return;
		}

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

module.exports=admin;
