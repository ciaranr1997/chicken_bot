const config = require("../../config.json");
const axios = require('axios').default;
var twitch = require("../../twitch.js");
var jsonwebtoken = require("jsonwebtoken");
var fs = require('fs');
extension =
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
		var sql = require("../../sql.js");
		if(this.req.headers["authorization"])
		{
			var token = this.req.headers["authorization"];
			var jwt = jsonwebtoken.verify(token, Buffer.from(config.twitch.extension.key,'base64'), { algorithms: ['HS256'] });
		}
		if(params[1]=="redemptions")
		{
			var listRedemptions = "SELECT * FROM fowl_redemptions WHERE isenabled=1 AND isdeleted=0 ORDER BY COST ASC";
			var redemptionList = await sql.syncQuery(listRedemptions);
			this.res.writeHead(200, {'Content-Type': 'text/json'});
			var result = {};
			result.redemptions=redemptionList;
			this.res.end(JSON.stringify(result));

		}
		else if(params[1]=="getbalance")
		{
			console.log(params[2]);
			var getPoints = "SELECT * FROM fowl_loyalty WHERE user_id=?";
			var pointsArray = await sql.syncQuery(getPoints,[params[2]]);
			var result = {};
			if(pointsArray.length==0)
			{
				result.points = 0;
			} else
			{
				result.points=pointsArray[0].points;
			}


			this.res.writeHead(200, {'Content-Type': 'text/json'});
			this.res.end(JSON.stringify(result));
		}
		else if(params[1]=="redeem")
		{
			//get redemption details:
			var redemptionQuery = "SELECT * FROM fowl_redemptions WHERE id=?";
			var redemptionArray = await sql.syncQuery(redemptionQuery,[params[2]]);
			var redemptionDetails = redemptionArray[0];
			var cost = redemptionDetails.cost;
			//get user points to confirm:
			var getPoints = "SELECT * FROM fowl_loyalty WHERE user_id=?";
			var pointsArray = await sql.syncQuery(getPoints,[jwt["user_id"]]);
			points=pointsArray[0].points;

			if(points<cost)
			{
				this.error("Not enough points!");
				return;
			}
			else
			{
				var io = this.req.app.get("socketio");
				var timestamp = new Date().getTime();
				var userDetails = await twitch.getUserInfo(jwt["user_id"]);
				userDetails = userDetails.data[0];
				sql.run("INSERT INTO redemption_queue (redemptionid,user_id,timestamp,username,text) VALUES(?,?,?,?,?)",[params[2],jwt["user_id"],timestamp,userDetails["display_name"],this.body.text]);
				sql.run("UPDATE fowl_loyalty SET points=points-"+cost+" WHERE user_id=?",[jwt["user_id"]]);
				var redemptionObj = {}
				redemptionObj.user = userDetails["display_name"];
				redemptionObj.redemptionSettings = redemptionDetails;
				redemptionObj.sentData = this.body;
				io.of("/redemptionsocket").emit("redemption",redemptionObj);
				this.end();
			}

		}
		else if(params[1]=="redemptionSettings")
		{
			var redemptionQuery = "SELECT * FROM fowl_redemptions WHERE id=?";
			var redemptionArray = await sql.syncQuery(redemptionQuery,[params[2]]);
			var redemptionDetails = redemptionArray[0];
			this.res.writeHead(200, {'Content-Type': 'text/json'});
			this.res.end(JSON.stringify(redemptionDetails));
		}
		else if(params[1]=="setbalance")
		{
			var updatePoints = "INSERT INTO  fowl_loyalty (user_id,points) VALUES(?,?) ON DUPLICATE KEY UPDATE points=?";
			//sql.run(updatePoints,[params[2],this.body.balance,this.body.balance]);
			var getPoints = "SELECT * FROM fowl_loyalty WHERE user_id=?";
			var pointsArray = await sql.syncQuery(getPoints,[params[2]]);
			var result = {};
			result.points=pointsArray[0].points;

			this.res.writeHead(200, {'Content-Type': 'text/json'});
			this.res.end(JSON.stringify(result));
		}else if(params[1]=="help")
		{
			var help = fs.readFileSync("html/twitchextension/help.html").toString();
			this.res.writeHead(200, {'Content-Type': 'text/plain'});
			this.res.end(help);

			return;
		}
			else
		{
			this.end();
		}


	},
	end:function()
	{
		this.res.writeHead(200, {'Content-Type': 'text/json'});
		this.res.end('{"success":"request was successful"}');
	},
	error:function(err)
	{
			console.log(err);
			this.res.writeHead(200, {'Content-Type': 'text/json'});
			this.res.end('{"error":"'+err+'"}');
	}
};

module.exports=extension;
