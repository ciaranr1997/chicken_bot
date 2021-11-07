const tmi = require('tmi.js');
const config = require("./config.json");
var twitch = require("./twitch");
var isLive = false;
const axios = require('axios').default;
var usersInChat = 0;
var userArray = [];
var userMinute =[];
const util = require('./utils');
const channel_name = config.twitch.channel_name;
const cooldowns = new Set();
var winnerMsg = "No winners so far";
var seconds = 0;
// Define configuration options
const opts = {
  identity: {
    username: config.twitch.bot_username,
    password: config.twitch.bot_oauth
  },
  channels: [
    "fowl_play_gaming"
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
async function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot
	let sql = require("./sql.js");
	parts = msg.split(' ');
  // Remove whitespace from chat message
  const commandName = parts[0].toLowerCase();
  // If the command is known, let's execute it
  if (commandName === '!watchtime') {
		if(parts.length>1)
		{
			user = parts[1].replace('@','');
		}
		else
		{
			user = context.username;
		}
		user_id = await twitch.getIdFromUsername(user);
		watchtime = await sql.syncQuery("select * from twitch_watchtime where user_id='"+user_id+"'");
		if(watchtime.length==0)
		{
	    client.say(target, `Could not find any watchtime info :(`);
		}
		else
		{
			var timewatched = util.secondsToDhms(watchtime[0].timer);
			client.say(target, `@${user} has spent ${timewatched} watching ${target}`);
		}
    console.log(`* Executed ${commandName} command`);
  }
	else if(commandName=='!guess')
	{
		killer = msg.replace("!guess ","");
		guess(killer,context.username);
	}
	else if(commandName=="!messages")
	{
		if(parts.length>1)
		{
			user = parts[1].replace('@','');
		}
		else
		{
			user = context.username;
		}
		user_id = await twitch.getIdFromUsername(user);
		messages = await sql.syncQuery("select * from twitch_messages where user_id='"+user_id+"'");
		if(messages.length==0)
		{
			client.say(target, `Could not find any message info :(`);
		}
		else
		{
			var messagecount = messages[0].message_count;
			console.log()
			client.say(target, `@${user} has sent ${messagecount} messages`);
		}
	}
	else if(commandName=="!confirm")
	{
		if(cooldowns.has("confirm")) return;
		if(context.mod==true||context.username==channel_name)
		{
			killer = parts[1];
			confirmKiller(killer);
			cooldowns.add("confirm");
			setTimeout(() => {
				cooldowns.delete("confirm");
			}, 30000);
		}
	}
	else if(commandName=="!winners")
	{
		client.say(target, `${winnerMsg}`);
	}
	else if(commandName=="!game")
	{
		//if(!isLive) return;
		var fowlDets = await twitch.getFowlDetails();

		var game = fowlDets[0].game_name;

		client.say(target, `Fowl is currently playing "${game}"`);
	}
	else if(commandName=="!hours")
	{
		getHours();
	}
	else if(commandName=="!escapes")
	{
		getDbdStats("DBD_Escape");
	} else if(commandName=="!skillchecks")
	{
		getDbdStats("DBD_SkillCheckSuccess");
	} else if(commandName=="!kills")
	{
		getDbdStats("DBD_SacrificedCampers");
	} else if(commandName=="!roll20")
	{
		var dice = Math.round(Math.random() * (20 - 1) + 1);
		client.say(target, `You rolled a ${dice}!`);
	}

	user_id = await twitch.getIdFromUsername(context.username);
	isBot = await twitch.checkBot(user_id);
	if(!isBot)
	{
		console.log(msg);
		query = "INSERT INTO  twitch_messages (user_id,message_count) VALUES(\""+user_id+"\",1) ON DUPLICATE KEY UPDATE message_count=message_count+1";
		sql.run(
			query
		);
	}

}

// Function called when the "dice" command is issued


// Called every time the bot connects to Twitch chat
async function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
	await twitch.getToken();
	isLive = await twitch.checkLive(channel_name);
	setInterval(minuteChecks,10000);
	usersInChatData = await twitch.getUsersInChat();
	usersInChat = usersInChatData.chatter_count;
	console.log(usersInChat);
	usersNow = createUserArray(usersInChatData.chatters);
	userArray = usersNow;


}

async function minuteChecks()
{
	isLive = await twitch.checkLive(channel_name);

	if(isLive)
	{
		usersInChatData = await twitch.getUsersInChat();
		usersInChat = usersInChatData.chatter_count;
		usersNow = createUserArray(usersInChatData.chatters);

		usersStayed = compareUsers(userArray,usersNow);
		addwatchtime(usersStayed);
		userArray = usersNow;
		seconds = seconds+10;
		if(seconds==60)
		{
			seconds = 0;
			usersStayedMin = compareUsers(userMinute,usersNow);
			addCurrency(usersStayedMin);
			userMinute = usersNow;

		}
	}
	else
	{
		seconds = 0;
	}

}

async function addCurrency(users)
{
	// check how much currency to get per minute first
	userIds = await twitch.getIdFromUsernameBulk(users);

	let sql = require("./sql.js");
	var loyaltyQuery = "SELECT * FROM loyalty_settings where setting_key='watchtime'";
	rows = await sql.syncQuery(loyaltyQuery);
	upBy = rows[0].value;
	for(i=0;i<userIds.length;i++)
	{
		user_id=userIds[i];
		isBot = await twitch.checkBot(user_id);
		if(!isBot)
		{
			query = "INSERT INTO  fowl_loyalty (user_id,points) VALUES(\""+user_id+"\","+upBy+") ON DUPLICATE KEY UPDATE points=points+"+upBy;
			sql.run(
				query
			);
		}
	}
}

function createUserArray(chatters)
{
	tmparray = [];
	for(list in chatters)
	{
		for(i=0;i<chatters[list].length;i++)
		{
			tmparray.push(chatters[list][i]);
		}
	}
	return tmparray;
}
function compareUsers(array1,array2)
{
	tmparray = [];
	for(i = 0;i<array2.length;i++)
	{
		if(array1.includes(array2[i]))
		{
			tmparray.push(array2[i]);
		}
	}
	return tmparray;
}


async function addwatchtime(users)
{
	userIds = await twitch.getIdFromUsernameBulk(users);
	for(i=0;i<userIds.length;i++)
	{
		var upBy = 10;
		user_id=userIds[i];
		let sql = require("./sql.js");
		isBot = await twitch.checkBot(user_id);
		if(!isBot)
		{
			query = "INSERT INTO  twitch_watchtime (user_id,timer) VALUES(\""+user_id+"\","+upBy+") ON DUPLICATE KEY UPDATE timer=timer+"+upBy;
			sql.run(
				query
			);
		}
	}
}



async function guess(killer,user)
{
	if(!isLive)
	{
		client.say("#"+channel_name, `Fowl is not currently live.`);
		return;
	}
	var fowlDets = await twitch.getFowlDetails();
	var game = "Dead by Daylight"//fowlDets[0].game_name;

	if(game!="Dead by Daylight")
	{
		client.say("#"+channel_name, `Fowl is currently playing "${game}" which is NOT Dead By Daylight. Why are you trying to guess the killer?`);
		return;
	}
	let sql = require("./sql.js");
	user_id = await twitch.getIdFromUsername(user);
	console.log(`${user}(${user_id}) has guessed ${killer}`);
	if(killer.toLowerCase()=="nea")
	{
		client.say("#"+channel_name,`/timeout ${user} 10`);
		client.say("#"+channel_name,`@${user} that joke was so funny that I accidentally timed you out`);
		return;
	}
	query = "SELECT * from killer_names WHERE killername LIKE ? OR aliases LIKE ?";
	results = await sql.syncQuery(query,["%"+killer+"%","%"+killer+"%"]);
	if(results.length==0)
	{
		client.say("#"+channel_name, `@${user} I could not find "${killer}"`);
		return;
	}
	confirmed = results[0].killername;

	//get id of current prediction
	pred_data = await sql.syncQuery("SELECT * FROM prediction_data ORDER BY prediction_id DESC LIMIT 1");
	predictionNo = pred_data[0].prediction_id;

	checkPrediction = await sql.syncQuery("SELECT * FROM killer_predictions WHERE prediction_id=? AND user_predicted=?",[predictionNo,user_id]);

	if(checkPrediction.length==0)
	{
		client.say("#"+channel_name, `@${user} you have guessed "${confirmed}"`);
		insert = "INSERT INTO killer_predictions (killer,user_predicted,user_nick,prediction_id) VALUES (?,?,?,?)";
		await sql.syncQuery(insert,[results[0].id,user_id,user,predictionNo]);
	}
	else
	{
		if(checkPrediction[0].killer==results[0].id)
		{
			client.say("#"+channel_name, `@${user} you have already guessed "${confirmed}"`);
		}
		else
		{
			oldKiller = await sql.syncQuery("SELECT * FROM killer_names where id=?",[checkPrediction[0].killer]);
			client.say("#"+channel_name, `@${user} you have changed your guess from "${oldKiller[0].killername}"" to "${confirmed}"`);
			update = "UPDATE killer_predictions set killer=? WHERE user_predicted=?";
			await sql.syncQuery(update,[results[0].id,user_id]);
		}
	}
}

async function confirmKiller(killer)
{
	let sql = require("./sql.js");
	query = "SELECT * from killer_names WHERE killername LIKE ? OR aliases LIKE ?";
	results = await sql.syncQuery(query,["%"+killer+"%","%"+killer+"%"]);
	confirmed = results[0].killername;
	console.log(`Killer confirmed as: ${confirmed}`);
	client.say("#"+channel_name, `Killer has been confirmed as "${confirmed}"!`);


	pred_data = await sql.syncQuery("SELECT * FROM prediction_data ORDER BY prediction_id DESC LIMIT 1");
	predictionNo = pred_data[0].prediction_id;
	timestamp = Date.now();

	update = "UPDATE prediction_data set result=?, finished=? WHERE prediction_id=?";
	await sql.syncQuery(update,[results[0].id,timestamp,predictionNo]);
	await sql.syncQuery("INSERT into prediction_data (started) VALUES (?)",[timestamp]);

	//get winners:
	winQuery = "SELECT * From killer_predictions WHERE killer=? AND prediction_id=?"
	winners = await sql.syncQuery(winQuery,[results[0].id,predictionNo]);
	if(winners.length==0)
	{
		winnerMsg = "Nobody guessed correctly this time. Better luck next time!";
		client.say("#"+channel_name,"Nobody guessed correctly this time. Better luck next time!");
	}
	else
	{
		console.log(winners);
		winmsg = "Winners are: ";
		var upBy = 250;
		for(i=0;i<winners.length;i++)
		{
			winmsg+= winners[i].user_nick+" ";
			var givePoints = "";
			var query2 = "INSERT INTO  fowl_loyalty (user_id,points) VALUES(\""+winners[i].user_predicted+"\","+upBy+") ON DUPLICATE KEY UPDATE points=points+"+upBy;
			console.log(query2);
			sql.run(
				query2
			);
		}
		winnerMsg = winmsg;
		client.say("#"+channel_name,winmsg);
	}
	setTimeout(guessInform,30000);
}
function guessInform()
{
	client.say("#"+channel_name,"Get your new killer guesses in now with !guess!");
}


async function getHours()
{
	res = await axios.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key="+config.steam.api_key+"&steamid=76561198046010977");
	games = res.data.response.games;
	hours = 0;
	for (i=0;i<games.length; i++)
	{ if (games[i].appid==381210)
		{
			hours = Math.round(games[i].playtime_forever/60)
			break;
		}
	}
	client.say("#"+channel_name,"Fowl has "+hours+" hours played in dead by daylight");

}
async function getDbdStats(statName)
{
	res = await axios.get("https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?key="+config.steam.api_key+"&steamid=76561198046010977&appid=381210");
	stats = res.data.playerstats.stats;
	statVal="";
	for(i=0;i<stats.length;i++)
	{
		if(stats[i].name==statName)
		{
			statVal=stats[i].value;
			break;
		}
	}
	switch(statName)
	{
		case "DBD_Escape":
			client.say("#"+channel_name,"Fowl has "+statVal+" escapes in dead by daylight");
		break;
		case "DBD_SkillCheckSuccess":
			client.say("#"+channel_name,"Fowl has hit "+statVal+" skillchecks in dead by daylight. He has missed "+(statVal*3)+" LUL");
		break;
		case "DBD_SacrificedCampers":
			client.say("#"+channel_name,"Fowl has sacrificed "+statVal+" survivors in dead by daylight");
		break;
		default:

		break;
	}
}
