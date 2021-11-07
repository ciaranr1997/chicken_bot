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
		;
		if(params[1]=="new")
		{
			var imgurl = body.imageUrl;
			if(imgurl=="")
			{
				imgurl = null;
			}
			var videoUrl = body.videoUrl;
			if(videoUrl=="")
			{
				videoUrl = null;
			}
			var audioUrl = body.audioUrl;
			if(audioUrl=="")
			{
				audioUrl = null;
			}
			query = "INSERT INTO fowl_redemptions (redemption_name,redemption_description,hastext,allowtts,imageurl,audiourl,videourl,cost) VALUES(?,?,?,?,?,?,?,?)";
			result = await sql.syncQuery(query,
				[body.name,body.description,body.text,body.tts,imgurl,audioUrl,videoUrl,body.cost]
			).catch(function(err)
			{
					this.error("query failed :(");
					this.res.writeHead(200, {'Content-Type': 'text/json'});
					this.res.end('{"error":"Request to add this redemption has failed."}');
					return;

			});
			this.res.writeHead(200, {'Content-Type': 'text/json'});
			this.res.end('{"success":"Added new option.","id":'+result.insertId+'}');
			return;
		}
		else if(params[1]=="getmedia")
		{
			type = body.type;
			var rtn = {};
			if(type=="imageaudio")
			{
				rtn.images = [];
				rtn.audio  = [];
				fs.readdirSync("./assets/sound").forEach(file => {
				  rtn.audio.push(file);
				});
				fs.readdirSync("./assets/images").forEach(file => {
				  rtn.images.push(file);
				});
			} else if(type=="video")
			{
				rtn.video = [];
				fs.readdirSync("./assets/videos").forEach(file => {
				  rtn.video.push(file);
				});
			} else if(type=="audio")
			{
				rtn.audio = [];
				fs.readdirSync("./assets/sound").forEach(file => {
				  rtn.audio.push(file);
				});
			} else if(type=="image")
			{
				rtn.images = [];
				fs.readdirSync("./assets/images").forEach(file => {
				  rtn.images.push(file);
				});
			}
			this.res.writeHead(200, {'Content-Type': 'text/json'});
			this.res.end(JSON.stringify(rtn));
			console.log(rtn);
			return;
		}
		else if(params[1]=="details")
		{
			id = body.id;
			query = "SELECT * FROM fowl_redemptions WHERE id="+id+";"
			result = await sql.syncQuery(query).catch(function(err)
			{
					this.error("query failed :(");
					this.res.writeHead(200, {'Content-Type': 'text/json'});
					this.res.end('{"error":"Request to update this has failed."}');
					return;

			})
			var rtn = {};

			if(result[0].audiourl!=""&&result[0].imageurl!=""&&result[0].audiourl!=null&&result[0].imageurl!=null)
			{
				rtn.images = [];
				rtn.audio  = [];
				fs.readdirSync("./assets/sound").forEach(file => {
				  rtn.audio.push(file);
				});
				fs.readdirSync("./assets/images").forEach(file => {
				  rtn.images.push(file);
				});
			} else if(result[0].videourl!=""&&result[0].videourl!=null)
			{
				rtn.video = [];
				fs.readdirSync("./assets/videos").forEach(file => {
				  rtn.video.push(file);
				});
			} else if(result[0].audiourl!=""&&result[0].audiourl!=null)
			{
				rtn.audio = [];
				fs.readdirSync("./assets/sound").forEach(file => {
				  rtn.audio.push(file);
				});
			} else if(result[0].imageurl!=""&&result[0].imageurl!=null)
			{
				rtn.images = [];
				fs.readdirSync("./assets/images").forEach(file => {
				  rtn.images.push(file);
				});
			}
			rtn.result = result[0];
			rtn.success="Success";
			this.res.writeHead(200, {'Content-Type': 'text/json'});
			this.res.end(JSON.stringify(rtn));
			return;
		}
		else
		{
			id = body.id;


			if(isNaN(id))
			{
				this.error("You don't seem to have sent a legit request to update/add an option");
				return;
			}
			if(params[1]=="enable")
			{
				query = "UPDATE fowl_redemptions SET isenabled=1 WHERE id="+id+";"
				result = await sql.syncQuery(query).catch(function(err)
				{
						this.error("query failed :(");
						this.res.writeHead(200, {'Content-Type': 'text/json'});
						this.res.end('{"error":"Request to update this has failed."}');
						return;

				})
			}
			else if(params[1]=="disable")
			{
				query = "UPDATE fowl_redemptions SET isenabled=0 WHERE id="+id+";"
				result = await sql.syncQuery(query).catch(function(err)
				{
						this.error("query failed :(");
						this.res.writeHead(200, {'Content-Type': 'text/json'});
						this.res.end('{"error":"Request to update this square has failed."}');
						return;

				})
			}
			else if(params[1]=="update")
			{
				var imgurl = body.imageUrl;
				if(imgurl=="")
				{
					imgurl = null;
				}
				var videoUrl = body.videoUrl;
				if(videoUrl=="")
				{
					videoUrl = null;
				}
				var audioUrl = body.audioUrl;
				if(audioUrl=="")
				{
					audioUrl = null;
				}
				query = "UPDATE fowl_redemptions set redemption_name=?,redemption_description=?,hastext=?,allowtts=?,imageurl=?,audiourl=?,videourl=?,cost=? where id="+body.id;
				result = await sql.syncQuery(query,
					[body.name,body.description,body.text,body.tts,imgurl,audioUrl,videoUrl,body.cost]
				).catch(function(err)
				{
						this.error("query failed :(");
						this.res.writeHead(200, {'Content-Type': 'text/json'});
						this.res.end('{"error":"Request to add this redemption has failed."}');
						return;

				});
				console.log(query);

			}
			else if(params[1]=="delete")
			{
				query = "UPDATE fowl_redemptions SET isdeleted=1 WHERE id="+id+";"
				result = await sql.syncQuery(query).catch(function(err)
				{
						this.error("query failed :(");
						this.res.writeHead(200, {'Content-Type': 'text/json'});
						this.res.end('{"error":"Request to update this square has failed."}');
						return;

				})
			}
			else
			{

			}

		}
		;
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
