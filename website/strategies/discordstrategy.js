const DiscordStrategy = require('passport-discord').Strategy;
const passport = require("passport");

const config = require('../../config.json');

passport.use(new DiscordStrategy({
	clientID: config.clientID,
	clientSecret: config.clientSecret,
	callbackURL: "auth/red",
	scope:['identify',"guilds"]
},(accessToken, refreshToken,profile,done) =>
{
	perms = 0;
	for(i=0; i<profile.guilds.length; i++)
	{
		if(profile.guilds[i].id==config.server_id)
		{
			perms = profile.guilds[i].permissions;
			console.log( profile.guilds[i]);
			break;
		}
	}
	//console.log(profile);
	user =
	{
		id: profile.id,
		username : profile.username,
		image:"//cdn.discordapp.com/avatars/"+profile.id+"/"+profile.avatar+".png",
		perms: perms
	}
  return done(null, user);

}
));
