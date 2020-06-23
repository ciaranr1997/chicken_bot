const sqlite3 = require('sqlite3').verbose();
const config = require("./config.json");

module.exports = {
	db:"",
	debug:"",
	connect:function(){
		this.db = new sqlite3.Database(config.database, sqlite3.OPEN_READWRITE, (err) => {
		  if (err) {
			console.error(err.message);
			this.debug.send("Open Err: "+err.message);
		  }
		  console.log('Connected to the database.');
		});
	},
	close:function()
	{
		this.db.close((err) => {
		  if (err) {
			console.error(err.message);
			this.debug.send("Close err: "+err.message);
		  }
		  console.log('Closed the database connection.');
		});

	},
	query:function(queryString, callback,msg)
	{
        this.db.all(queryString, [], (err, rows) => {
          if (err) {
            console.log(err);
          }
            console.log(rows);
           callback(msg,rows);
        });
    },
    run:async function(sql,params)
    {
        this.db.run(sql, params, function(err){
            if(err)
            {
							console.log("run "+sql);
							if(err.message.includes("SQLITE_BUSY"))
							{
								setTimeout(function()
								{
									sqlh.retry(sql);
								}
								,500)
							} else
							{
            		console.log(err);
								console.log(sql);
							}
            }
        });
    },
		retry:async function(sql)
		{
			console.log("Retry");
			console.log(sql);
			this.db.run(sql, [], function(err){
				sqlh = this;
					if(err)
					{
						console.log(err);

					}
			});
		}
}
