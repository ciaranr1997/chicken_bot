const config = require("../../config.json");
const axios = require('axios').default;
var twitch = require("../../twitch.js");

admin =
{
	params:[],
	req:{},
	res:{},
	start:async function(req,res,reqParams)
	{
		this.params = reqParams;
		this.req = req;
		this.res = res;
		this.body = req.body
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

		names = this.body.txt.split(/\r?\n/);
		var ids = await twitch.getIdFromUsernameBulk(names);
		console.log(ids);
		var dets = await twitch.getUserDetailsBulk(ids);
		var rtnVal = "";
		for(i=0;i<dets.length;i++)
		{
			rtnVal+=dets[i]["display_name"]+":"+dets[i]["id"]+"\n";
		}
		this.res.writeHead(200, {'Content-Type': 'text/json'});
		this.res.end('{"success":'+rtnVal+'}');
		//this.end();
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
