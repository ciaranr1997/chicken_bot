const router = require('express').Router();
const passport = require("passport");
const fs = require('fs');


router.get('/',(req,res)=>{
	if(!req.user)
	{
		res.redirect('/');
		return;
	}
	nav = fs.readFileSync("pageparts/nav.html").toString();
	header = fs.readFileSync("pageparts/header.html").toString();
	fs.readFile('html/bingo.html', async (e, data) => {

		html = data.toString();
		let sql = require("../../sql.js");
		//;
		is_active = await sql.syncQuery("select setting_value from bingo_settings where setting=\"is_active\"");
		is_active = is_active[0].setting_value;
		//allCards = await sql.syncQuery("select * from bingo_options");

		checkedQuery = "SELECT * FROM bingo_options";
		checkedArr = await sql.syncQuery(checkedQuery);
		if(is_active==1)
		{

			if (e) throw e;
			userCard = await sql.syncQuery("select * from bingo_cards where is_active=1 AND user_id="+req.user.id);

			if(userCard.length==0)
			{
				ezrows = await sql.syncQuery("select * from bingo_options where difficulty=1 and is_active=1 ORDER BY RAND() LIMIT 8");
				medrows = await sql.syncQuery("select * from bingo_options where difficulty=2 and is_active=1 ORDER BY RAND() LIMIT 6");
				hardrows = await sql.syncQuery("select * from bingo_options where difficulty=3 and is_active=1 ORDER BY RAND() LIMIT 2");
				all = ezrows.concat(medrows);
				all = all.concat(hardrows);
				shuffle(all);
				cardData = JSON.stringify(all);
				sql.run("INSERT INTO bingo_cards (user_id,card_data,is_active) VALUES(?,?,1)",[req.user.id,cardData]);

			}
			else
			{
				all = JSON.parse(userCard[0].card_data);
			}
			cards = "";
			for(i=0; i<all.length;i++)
			{
				//check if the square has been checked off
				id= all[i].id;
				dif = "";
				//checked = await sql.syncQuery("select is_called from bingo_options where id='"+id+"'");
				//checked = checked[0].is_called;
				//checked = allCards.find(o => o.id === id).is_called;
				if(all[i].difficulty==1) dif = "easy"
				if(all[i].difficulty==2) dif = "medium"
				if(all[i].difficulty==3) dif = "hard"
				checked = checked = checkedArr.find(x => x.id === id).is_called;

				cards+='<div class="tile  ';
				if(checked)
				{
					cards+="checked "
				}
				cards+= dif+'" id="card-'+id+'">';
				cards+='<span class="bingo-text">';
				cards+=all[i].card_text;
				cards+='</span>'
				cards+="</div>"

			}
			html = html.replace("${bingo.cards}",cards);
		}
		else
		{
			html = html.replace("${bingo.cards}","<div class=\"bingo-err\">Bingo is currently closed. Please check back another time.</div>");
		}

		//await ;
		html = html.replace("${site.header}",header);
		html = html.replace("${site.nav}",nav);
		html = html.replace("${user.image}",req.user.image);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	});
});


module.exports = router;
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
