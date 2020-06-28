const mysql = require('mysql');
const config = require("./config.json");

module.exports = {
	db:"",
	debug:"",
	connect:function(){

		this.db = mysql.createConnection(config.mysql);
		this.db.connect(function(err) {
		  if (err) throw err;
		});
	},
	close:function()
	{
		this.db.end((err) => {
		  if (err) {
			console.error(err.message);
			this.debug.send("Close err: "+err.message);
		  }
		});

	},
	query:function(queryString, callback,msg)
	{
        this.db.query(queryString, [], (err, rows) => {
          if (err) {
						console.log("ERROR");
            console.log(err);
          }
						rows =JSON.stringify(rows);
						rows = JSON.parse(rows);
           	callback(msg,rows);
        });
    },
    run:async function(sql,params)
    {
        this.db.query(sql, params, function(err){
            if(err)
            {
							console.log("run "+sql);
          		console.log(err);

            }
        });
    }
}
