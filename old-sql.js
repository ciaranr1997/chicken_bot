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
		setTimeout(function(){ try{this.db.end();}catch{} }, 5000);
	},
	close:function()
	{
		/*await this.db.end((err) => {
		  if (err) {
			console.error("sql close error: "+err.message);
			console.log(err);
		  }
			else
			{
				console.log(this.db.state);
				console.log("closed");
			}
		});*/

		return new Promise(function(resolve, reject){
			this.db.end((err) => {
			  if (err) {
				console.error("sql close error: "+err.message);
				console.log(err);
				reject(new Error(err.message));
			  }
				else
				{
					console.log(this.db.state);
					console.log("closed");
					this.db.destroy();
						console.log(this.db.state);
						resolve("closed");
				}
			});
		});
	},
	query:function(queryString, callback,msg)
	{

        db.query(queryString, [], (err, rows) => {
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
    },
		syncQuery:function(queryString)
		{

				return new Promise(function(resolve, reject){
        	db.query(queryString, [], (err, rows) => {

	          if (err) {
							console.log("ERROR");
	            console.log(err);
							reject(new Error(err));
	          }
							rows = JSON.stringify(rows);
							rows = JSON.parse(rows);


						if(rows === undefined){
                reject(new Error("Error rows is undefined"));
            }else{
                resolve(rows);
            }
        	});
				});
	    }
}
