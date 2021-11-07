const config = require('./config.json');
const axios = require('axios').default;
//axios.defaults.headers.post['Content-Type'] =

var twitch =
{
	getToken:async function()
	{
			url = "https://id.twitch.tv/oauth2/token?grant_type=client_credentials&client_secret="+config.twitch.client_secret;
			console.log(url);
			await axios.post(url,{},{headers:{
				"Client-ID": config.twitch.client_id,
				"Content-Type":'application/json;charset=UTF-8'
			}})
		  .then(function (response) {
				process.env.twitch=response.data.access_token;
				console.log(response.data.access_token);
				twitch.refreshToken(response.data.expires_in*1000);
		  })
		  .catch(function (error) {
		    console.log(error);
				console.log("ERROR");

		  });
	},
	refreshToken:function(time)
	{
		if(time>2147483647)
		{
			setTimeout(function()
			{
				time=time-2147483647;
				twitch.refreshToken(time);
			},2147483647)
		}
		else
		{
			console.log(time);
			setTimeout(function()
			{
				twitch.getToken();
			},time)
		}

	},
	checkToken:async function(token)
	{
		url = "https://id.twitch.tv/oauth2/validate";

		var response = await axios.get(url,
			{
			headers:{
				"Authorization": 'OAuth '+token
			}
		});


	 	// return it
	 	return response.data;
	},
	getUserInfo:async function(id)
	{
		url = "https://api.twitch.tv/helix/users?id="+id;

		var response = await axios.get(url,
			{
			headers:{
				"Client-ID": config.twitch.client_id,
				"Authorization": 'Bearer '+process.env.twitch
			}
		});
		return response.data;
	},
	getAuth:async function(code,redirect)
	{
		url = "https://id.twitch.tv/oauth2/token?client_secret="+config.twitch.client_secret+"&grant_type=authorization_code&code="+code+"&redirect_uri="+redirect;
		console.log(url);
		var response = await axios.post(url,{},
			{
			headers:{
				"Content-Type":'application/json;charset=UTF-8',
				"Client-ID": config.twitch.client_id,
				"code": code,
				"grant-type": "authorization_code",
				"client-secret": config.twitch.client_secret,
				"redirect-uri": redirect+config.twitch.redirect_uri,

			}
		});
		return response.data;
	},
	checkLive:async function(user)
	{
		url = "https://api.twitch.tv/helix/streams?user_login="+user;

		result = await axios.get(url,
			{
			headers:{
				"Client-ID": config.twitch.client_id,
				"Authorization": 'Bearer '+process.env.twitch
			}
		});
		if(result.data.data.length>0)
		{
			return true;
		} else
		{
			return false;
		}

	},
	getUsersInChat:async function()
	{
		var url = config.twitch.chat_link;
		var response = await axios.get(url);
		return response.data;
	},
	getIdFromUsername:async function(username)
	{
		var url = "https://api.twitch.tv/helix/users?login="+username;
		result = await axios.get(url,
			{
			headers:{
				"Client-ID": config.twitch.client_id,
				"Authorization": 'Bearer '+process.env.twitch
			}
		});

		if(result.data.data.length>0)
		{

			return result.data.data[0].id;
		}
		else
		{
			return -1;
		}
	},
	getIdFromUsernameBulk:async function(usernames)
	{
		if(usernames.length<=100){
			var url = "https://api.twitch.tv/helix/users?login="+usernames[0];
			for(i=1;i<usernames.length;i++)
			{
				url+="&login="+usernames[i];
			}
			result = await axios.get(url,
				{
				headers:{
					"Client-ID": config.twitch.client_id,
					"Authorization": 'Bearer '+process.env.twitch
				}
			});
			console.log(result.data.data);
			if(result.data.data.length>0)
			{
				arr=[];
				for(i=0;i<result.data.data.length;i++)
				{
					arr.push(result.data.data[i].id);
				}
				return arr;
			}
			else
			{
				return -1;
			}
		}
		else
		{
			arr = []
			var i,j,temparray,chunk = 99;
			for (i=0,j=usernames.length; i<j; i+=chunk)
			{
			    temparray = usernames.slice(i,i+chunk);
					var url = "https://api.twitch.tv/helix/users?login="+temparray[0];
					for(u=1;u<temparray.length;u++)
					{
						url+="&login="+temparray[u];
					}
					result = await axios.get(url,
						{
						headers:{
							"Client-ID": config.twitch.client_id,
							"Authorization": 'Bearer '+process.env.twitch
						}
					});

					if(result.data.data.length>0)
					{
						for(v=0;v<result.data.data.length;v++)
						{
							arr.push(result.data.data[v].id);
						}
					}
			}
			return arr;
		}
	},
	getFowlDetails:async function(){

		url = "https://api.twitch.tv/helix/streams?user_login=fowl_play_gaming";

		result = await axios.get(url,
			{
			headers:{
				"Client-ID": config.twitch.client_id,
				"Authorization": 'Bearer '+process.env.twitch
			}
		});
		return result.data.data;

	},
	getUserDetailsBulk:async function(ids)
	{
		if(ids.length<=100){
			var url = "https://api.twitch.tv/helix/users?id="+ids[0];
			for(i=1;i<ids.length;i++)
			{
				url+="&id="+ids[i];
			}
			result = await axios.get(url,
				{
				headers:{
					"Client-ID": config.twitch.client_id,
					"Authorization": 'Bearer '+process.env.twitch
				}
			});

			if(result.data.data.length>0)
			{
				arr=[];
				for(i=0;i<result.data.data.length;i++)
				{
					arr.push(result.data.data[i]);
				}
				return arr;
			}
			else
			{
				return -1;
			}
		}
		else
		{
			arr = []
			var i,j,temparray,chunk = 99;
			for (i=0,j=ids.length; i<j; i+=chunk)
			{
			    temparray = ids.slice(i,i+chunk);
					var url = "https://api.twitch.tv/helix/users?id="+temparray[0];
					for(u=1;u<temparray.length;u++)
					{
						url+="&id="+temparray[u];
					}
					result = await axios.get(url,
						{
						headers:{
							"Client-ID": config.twitch.client_id,
							"Authorization": 'Bearer '+process.env.twitch
						}
					});

					if(result.data.data.length>0)
					{
						for(v=0;v<result.data.data.length;v++)
						{
							arr.push(result.data.data[v]);
						}
					}
			}
			return arr;
		}
	},
	checkBot:async function(id)
	{
		if(id==-1)
		{
			return true;
		}
		var url = "https://api.twitchbots.info/v2/bot/"+id;
		try
		{
			result = await axios.get(url);
		}
		catch(e)
		{
			result = {"code":404};
		}
		if(result.code==404)
		{
			return false;
		}
		else
		{
			return true;
		}
	}
}
module.exports = twitch;
