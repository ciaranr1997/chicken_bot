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
	//console.log(profile);
	user =
	{
		id: profile.id,
		username : profile.username,
		image:"//cdn.discordapp.com/avatars/"+profile.id+"/"+profile.avatar+".png"
	}
  return done(null, user);

}
));
