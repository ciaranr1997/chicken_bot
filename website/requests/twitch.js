const axios = require('axios').default;
const config = require('../../config.json');

twitch =
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
		let sql = require("../../sql.js");

		if(params[1]=="check")
		{

			url = "https://api.twitch.tv/helix/streams?user_login=fowl_play_gaming";

			axios.get(url,
				{
		    headers:{
					"Client-ID": config.twitch.client_id,
			    "Authorization": 'Bearer '+process.env.twitch
				}
		  })
		  .then(function (response) {
		   	twitch.end(response.data.data);
		  })
		  .catch(function (error) {
		    console.log(error);
				console.log("ERROR");
				twitch.error(error);
		  });

		}
		else if(params[1]=="offlineimg")
		{
			url = "https://api.twitch.tv/helix/users?login=fowl_play_gaming";

			axios.get(url,
				{
		    headers:{
					"Client-ID": config.twitch.client_id,
			    "Authorization": 'Bearer '+process.env.twitch
				}
		  })
		  .then(function (response) {
		   	twitch.end(response.data.data);
		  })
		  .catch(function (error) {
		    console.log(error);
				console.log("ERROR");
				twitch.error(error);
		  });
		}

	},
	end:function(data)
	{
		console.log(data);
		this.res.writeHead(200, {'Content-Type': 'text/json'});
		this.res.end(JSON.stringify(data));
	},
	error:function(err)
	{
			this.res.writeHead(200, {'Content-Type': 'text/json'});
			this.res.end('{"error":"'+err+'"}');
	}
};

module.exports=twitch;
