const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');
const config = require("../../config.json");

router.get('/',async(req,res)=>{
	var twitch = require("../../twitch.js");

	twitch.checkLive();
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/user.html', async (e, data) => {
		let sql = require("../../sql.js");
		connections = await sql.syncQuery("select * from connections where user_id='"+req.user.id+"'");
		var connectionArea="<table class='connections'>";
		if(connections.length>0)
		{
			connectionArea +="<tr><td>Service</td><td>Username</td><td>Connected Since</td><td>Profile Picture</td><td>Actions</td></tr>";
			for(i=0;i<connections.length;i++)
			{
				console.log(connections[i]);

				connectionArea += "<tr class='connection ";
				if(connections[i].service=="twitch")
				{
					var twitch = require("../../twitch");

					userInfo = await twitch.getUserInfo(connections[i].connected_id);
					connectionArea += "twitch'>";
					connectionArea += "<td><span><img src='/static/images/twitch.png'/ class='site-logo'></span></td>";
					connectionArea += "<td class='info'>"+userInfo.data[0].display_name+"</td>";

					var date = new Date(connections[i].date_connected * 1);

					connectionArea += "<td>"+date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()+"</td>";
					connectionArea += "<td><img class='pfp' src='"+userInfo.data[0].profile_image_url+"'/></td>";
					connectionArea += "<td>x</td>";
				}
				connectionArea += "</tr>";

			}
		} else
		{
			connectionArea+="<tr><td>No connections? Add some!</td></tr>";
			connectionArea+="<tr><td><a href='/twitch'><img src='/static/images/twitch.png'/ class='site-logo'></a></td></tr>"
		}
		connectionArea += "</table>";


		html = data.toString();
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${user.image}",req.user.image);
		html = html.replace("${user.name}",req.user.username);
		html = html.replace("${user.connections}",connectionArea);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	});
});
module.exports = router;
