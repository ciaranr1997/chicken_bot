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
		var io = this.req.app.get("socketio");

		if(!this.req.user)
		{
			this.error("You are not currently logged in");
			return;
		}
		id = body.id;
		let sql = require("../../sql.js");

		if(params[1]=="check")
		{
			checked = await sql.syncQuery("select is_called from bingo_options where id='"+id+"'");
			checked = checked[0].is_called;
			if(checked==0)
			{
				this.res.writeHead(200, {'Content-Type': 'text/json'});
				this.res.end('{"error":"Denied"}');
				return;
			}
		} else if(params[1]=="bingo")
		{
			io.of("/bingosocket").emit("bingo",{"user":this.req.user.username,"type":body.type});
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
