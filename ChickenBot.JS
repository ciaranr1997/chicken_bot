/***********************
******SETUP STUFF*******
***********************/
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");

var debug;
var movieAnnounce;
var me;
var audRole;
client.login(config.token);


/***********************
*****DISCORD EVENTS*****
***********************/

//discord client has recieved a message event
client.on('message', async msg => {
if(!msg.author.bot)
{
if(msg.guild==null)
{
	//Code for DM management
	chat = msg.content;
	if(chat.charAt(0)===config.prefix)
	{
		if(chat==config.prefix+"myquotes")
		{
			let sql = require("./sql.js")
			sql.debug = debug;
			sql.connect();
			sql.query("SELECT * FROM fowl_quotes where user_id="+msg.author.id,ListQuotes,msg );
			sql.close();
		}
		if(chat.includes(config.prefix+"redact"))
		{
			qid = msg.content.replace(config.prefix+"redact ","");
			redactQuote(quid)
		}
	}
}
else
{
	chat = msg.content;
	if(chat.charAt(0)===config.prefix)
	{
		if(canUseBot(msg.member))
		{

			//ping check, just make sure the bot is alive :)
			if(chat==="!ping"&&isMod(msg.member)){
				msg.channel.send("Cluck Cluck");
			}

			//seriously, get on this!
			if(chat==config.prefix+"fhelp")
			{
				msg.reply("Ciaran hasn't programmed this in yet. Tell him to get a move on!");
			}

			//rquote command
			if(chat.includes(config.prefix+"rquote"))
			{
				let sql = require("./sql.js")
				sql.debug = debug;
				sql.connect();
				sql.query("SELECT * FROM fowl_quotes ORDER BY RANDOM() LIMIT 1",sayQuote,msg);
				sql.close();
			}

			//lquote command
			if(chat.includes(config.prefix+"lquote"))
			{
				let sql = require("./sql.js")

				sql.debug = debug;
				sql.connect();
				sql.query("SELECT * FROM fowl_quotes ORDER BY id desc LIMIT 1",sayQuote,msg);
				sql.close();
			}

			//hug command
			if(chat.includes(config.prefix+"hug"))
			{
				hug(msg);
			}

			//schedule a new movie night
			if(chat.includes(config.prefix+"schedule"))
			{
				let tmdb = require("./moviedb.js");
				chat = chat.replace(config.prefix+"schedule ","");
				year = chat.match(/\(\d\d\d\d\)/);
				if(year)
				{
					movie = chat.replace(year,"");
					year = year[0].substring(1,5);
				} else
				{
					movie = chat;
				}
				console.log("Movie: " +movie);
				console.log("Year: "+year);
				tmdb.movieSearch(movie,returnMovies,year,msg);
			}
			//add a new quote
			if(chat.includes(config.prefix+"quote"))
			{
				addQuote(msg)
			}

		}
		else
		{

		}
	}
}

}
});

///Log message deletions
client.on("messageDelete", async function (messageDelete) {
console.log(`The message : "${messageDelete.content}" by ${messageDelete.author.tag} was deleted.`)
if(messageDelete.author.bot)
{
return false;
}
let sql = require("./sql.js")
now = Date.now()/1000;
sql.debug = debug;
sql.connect();
sql.run(
"INSERT INTO messages_deleted (message_content,user_tag,user_id,timestamp,message_sent,channel_name) VALUES(?,?,?,?,?,?)",
[
	messageDelete.content,
	messageDelete.author.tag,
	messageDelete.author.id,
	now,messageDelete.createdTimestamp,
	messageDelete.channel.name
]
);
sql.close();
});

///log message edits
client.on('messageUpdate', (oldMessage, newMessage) => {
if(oldMessage.author.bot)
{
return false;
}
console.log(oldMessage.author.tag+" ("+oldMessage.author.id+")" + " has changed their message from \n"+oldMessage.content+"\nto\n"+newMessage.content);
let sql = require("./sql.js")
now = Date.now()/1000;
sql.debug = debug;
sql.connect();
sql.run(
"INSERT INTO messages_edited (old_content,new_content,user_tag,user_id,timestamp,channel_name) VALUES(?,?,?,?,?,?)",
[
	oldMessage.content,
	newMessage.content,
	oldMessage.author.tag,
	oldMessage.author.id,
	now,
	oldMessage.channel.name
]
);
sql.close();
});


/// This managed the voice roles for users
/// Who join the movie channels
/// And gives them access to the text channel
client.on('voiceStateUpdate', (oldState, newState) => {

newMember = newState.member;
oldMember = oldState.member;

let newUserChannel = newState.channel;
let oldUserChannel = oldState.channel;

if(newUserChannel!==oldUserChannel)
{
if(oldUserChannel === null && newUserChannel !== null)
{ //user has joined a voice channel
	channelName = newUserChannel.name;
	channelID = newUserChannel.id;
	if(channelID==config.movie_channel||channelID==config.after_movie)
	{
		newMember.roles.add(config.audience);
	}

}
else if(newUserChannel === null)// user has left voice
{

	channelName = oldUserChannel.name;
	channelID = oldUserChannel.id;
	if(channelID==config.movie_channel||channelID==config.after_movie)
	{
		oldMember.roles.remove(config.audience);
	}

}
else //user has moved from one channel to the other
{
	//sometimes things bug out here, best to put in a try/catch to be safe
	try
	{
		channelName = newUserChannel.name;
		channelID = newUserChannel.id;
		if(channelID==config.movie_channel||channelID==config.after_movie)
		{
			newMember.roles.add(config.audience);
		}
		else
		{
			newMember.roles.remove(config.audience);
		}
	}
	catch
	{
		newMember.roles.remove(config.audience);
	}
}

}


});

//Bot is logged in to discord now.
client.on('ready', () => {
console.log(`Logged in as ${client.user.tag}!`);
//const guild = client.guilds.get(config.server_id);
debug = client.channels.cache.get(config.debug_channel);
movieAnnounce = client.channels.cache.get(config.movie_announce);
client.user.setPresence({activity:{ name: 'Watching over the coop. '+config.prefix+'fhelp' }, status: 'available'});
debug.send("I'm awake!");
var d = new Date();
var n = d.getMinutes();
offset = (60-n)*60000;
setTimeout(HourlyCheck,offset);
});



/***********************
*********MOVIES*********
***********************/

//schedule the movie for the movie night and put in the announcement
function schedule(movieparams,msg)
{
let resp = msg.reply("When would you like to schedule a movie night?").then(sent => { // 'sent' is that message you just sent
const collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 30000 });
collector.on('collect', message => {
	const startdate = Date.parse(message)/1000;
	announcement = {
		"embed": {
			"title": movieparams.title,
			"description": "Join the coop in a movie night to watch \n**"+movieparams.title+"**",
			"url": "https://www.themoviedb.org/movie/"+movieparams.id,
			"color": 980195,
			"thumbnail": {
				"url": "https://image.tmdb.org/t/p/original"+movieparams.poster_path
			},
			"fields": [
				{
					"name": "Start Time",
					"value": message
				},
				{
					"name": "Host",
					"value": msg.author
				},
				{
					"name": "Overview",
					"value": movieparams.overview
				},
			]
		}
	}
	collector.stop();
	if(movieparams.runtime!=null)
	{
		announcement.embed.fields.push(
			{
				"name": "Runtime",
				"value": movieparams.runtime+" minutes"
			});
		}
		if(movieparams.trailer!=null)
		{
			announcement.embed.fields.push(
				{
					"name": "Trailer",
					"value": movieparams.trailer
				};
			}

			movieAnnounce.send(announcement);
			message.delete();
			msg.delete();
			sent.delete();
			/******* Input Schedule******/
			/*let sql = require("./sql.js")
			sql.debug = debug;
			sql.connect();
			sql.run("SELECT * FROM movie_nights" );
			sql.close();*/
		})
	});
}

//Get the list of movies for the user to select from
function returnMovies(data,msg)
{
	console.log(data);
	if(data.results.length > 0)
	{
		movies = data.results;
		if(movies.length  === 1)
		{
			//ask for start time
			let movieRequest =  require("./moviedb.js");
			schedule(movies[0],msg,getTrailer);
		}
		else
		{
			response = "There are more than one movies found. Please pick from the top results by replying with the id (in bold)\n\n";
			for(i=0; i<movies.length; i++)
			{
				response+= "**"+movies[i].id+"** "+movies[i].title+" "+movies[i].release_date+"\n";

			}
			response+="\nIf the movie you have requested does not show type _'cancel'_ and try again with a more specific query";
			msg.reply(response).then(sent => { // 'sent' is that message you just sent
				const collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 30000 });

				collector.on('collect', message => {
					if(!message.content.includes("cancel"))
					{
						let movieRequest =  require("./moviedb.js");
						movieRequest.movieById(message.content,msg,getTrailer);
					} else
					{
						msg.reply("Okay :)");
					}
					sent.delete();
					message.delete();
					collector.stop();
				})
			});


		}
	}
	else
	{
		msg.reply("I can't find that movie. Please try again :(");
	}
	
}

//get the trailer of a movie
function getTrailer(movieparams,msg,data)
{
	console.log("data");
	console.log(data);
	videos = data.results;
	console.log("results");
	console.log(videos);
	if(videos.length==0)
	{
		return;
	}
	trailer = "";
	for(i=0;i<videos.length;i++)
	{
		if(videos[i].type=="Trailer"&&videos[i].site=="YouTube")
		{
			trailer = "https://www.youtube.com/watch?v="+videos[i].key
			break;
		}
	}
	movieparams.trailer = trailer;
	schedule(movieparams,msg);
}


/***********************
*********UTILS**********
***********************/
function getMention(message)
{
	const withoutPrefix = message.content.slice(config.prefix.length);
	const split = withoutPrefix.split(/ +/);
	const command = split[0];
	mention = split[1];
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}
		return mention
	}
}


//the hourly checks to be run
function HourlyCheck()
{
	/*let sql = require("./sql.js")
	sql.debug = debug;
	sql.connect();



	now = Date.now()/1000;
	hour3 = now+ (3*3600);
	oldMovies = "SELECT * FROM movie_nights WHERE starttime<"
	//check for movie nights within the next hour
	hour = now+3600+900;
	movieHour = "SELECT * FROM movie_nights WHERE starttime>"+now+" AND starttime<"+hour+" ORDER BY id ASC";
	sql.query(movieCheck,movieHour);
	offset = 60*60000;
	debug.send("Running hourly tasks in "+offset);
	sql.close();
	setTimeout(HourlyCheck,offset);*/
}

function movieSoon(rows)
{
	for(i=0; i < rows.length; i++)
	{

	}
}




/***********************
*********PERMS**********
***********************/
function canUseBot(member)
{
	botPerms = false;
	highestRole = member.roles.highest;
	config.mod_roles.forEach(function(role){
		if(role==highestRole.id)
		{
			botPerms = true;
		}
	});
	config.bot_allowed.forEach(function(role){
		if(role==highestRole.id)
		{
			botPerms = true;
		}
	});
	if(member.user.id=="663320071237664779")
	{
		botPerms = false;
	}
	return botPerms;
}
function isMod(member)
{
	botPerms = false;
	highestRole = member.roles.highest;
	config.mod_roles.forEach(function(role){
		if(role==highestRole.id)
		{
			botPerms = true;
		}
	});
	return botPerms;
}


/***********************
*********QUOTES*********
***********************/

//Get quotes from the mentioned user and add it to the quotes database
async function addQuote(msg)
{
	men = getMention(msg);
	if(!men) return;
	mention = client.users.fetch(men);
	messages = await msg.channel.messages.fetch(mention.lastMessageID);
	messages = messages.array();
	output = "Please select the quote from the below list\n";
	u=0;
	options = ["_"];//dummy null entry to make life easier for the user
	for(i=0;i<messages.length;i++)
	{

		if(messages[i].author.id==men)
		{
			u++;
			options[u] = messages[i].content;
			output+="**"+u+"** "+messages[i].content+"\n----------\n";
			if(u==5)
			{
				break;
			}
		}
	}
	if(u==0)
	{
		msg.reply("Sorry no messages for this user have been found in this channel");
		return;
	}
	output+="type 'cancel' to stop";
	msg.reply(output).then(sent => { // 'sent' is that message you just sent
		const collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 30000 });

		collector.on('collect', message => {
			if(!message.content.includes("cancel"))
			{
				msg.reply("You have selected "+options[message.content]);
				console.log("Test - "+message.content);
				quote = options[message.content];
				let sql = require("./sql.js")
				sql.debug = debug;
				sql.connect();
				sql.run("INSERT INTO fowl_quotes (user_id,quote) VALUES(?,?)",[men,quote]);
				sql.close();
			}
			else
			{
				msg.reply("Okay :)");
			}
			sent.delete();
			message.delete();
			msg.delete();
			collector.stop();
		})
	});

}

//get the user's quotes in DMs to allow them to be redacted
function ListQuotes(msg,rows)
{
	if(rows.length==0)
	{
		msg.reply("You have no quotes");
		return;
	}
	output = "Here is a list of your quotes\n\n----------\n"
	for (i=0;i<rows.length;i++)
	{
		output += "**"+rows[i].id+"** "+rows[i].quote+"\n-----\n";
	}
	console.log(output);
	msg.reply(output);
}

//Take the quote mentioned and update it to remove the link to the user
function redactQuote(quid)
{
	let sql = require("./sql.js")
	sql.debug = debug;
	sql.connect();
	sql.run("UPDATE fowl_quotes set user_id=0 where id="+qid+" AND user_id='"+msg.author.id+"'" );
	sql.run("INSERT INTO redacted_quotes (quote_id,user_id) VALUES ("+qid+",'"+msg.author.id+"')" );
	sql.close();
	msg.reply("I have redacted this quote for you. If you require further action on this please DM a member of the mod team for this to be resolved");
}

//Say the quote that has been retrieved from the database
async function sayQuote(msg,rows)
{
	if(rows[0].user_id=="0")
	{
		user = "_redacted_";
	}
	else if(!msg.guild.members.cache.get(rows[0].user_id))
	{
		user = await client.users.fetch(rows[0].user_id);
		user = user.username;
	} else
	{
		user = msg.guild.members.cache.get(rows[0].user_id).displayName + " ("+msg.guild.members.cache.get(rows[0].user_id).user.tag+")";
	}
	msg.channel.send("> "+rows[0].quote+"\n - "+user+"");
}

/***********************
*********MISC**********
***********************/
function hug(message)
{
	mention = getMention(message);
	if (!mention) return;
	message.channel.send("The coop sends their virtual hugs <@"+mention+"> <:FowlHeart:713701989707546634>");
	message.delete();

}

/***********************
********TESTING*********
***********************/
function processTest(rows)
{
	console.log("Running test processing");
	console.log(rows);
}
