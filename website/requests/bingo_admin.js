admin =
{
	params:[],
	req:{},
	res:{},
	start:function(req,res,reqParams)
	{
		this.params = reqParams;
		this.req = req;
		this.res = res;
		body = req.body
		this.run();
	},
	run:async function()
	{
		if(!this.req.user)
		{
			this.error("You are not currently logged in");
			return;
		}
		if(this.req.user.perms!=2147483647)
		{
			this.error("You are not currently logged in as an admin");
			return;
		}

		let sql = require("../../sql.js");
		sql.connect();
		if(params[1]=="new")
		{
			difficulty = body.difficulty;
			text = body.text;
			query = "INSERT INTO bingo_options (card_text,difficulty,is_active) VALUES('"+text+"',"+difficulty+",1)";
			result = await sql.syncQuery(query).catch(function(err)
			{
					this.error("query failed :(");
					this.res.writeHead(200, {'Content-Type': 'text/json'});
					this.res.end('{"error":"Request to add this square has failed."}');
					return;

			});
			this.res.writeHead(200, {'Content-Type': 'text/json'});
			this.res.end('{"success":"Added new option.","id":'+result.insertId+'}');
			return;
		}
		else if(params[1]=="status")
		{
			new_status = body.new_status;
			if(isNaN(new_status))
			{
				this.error("You don't seem to have sent a legit request to update bingo");
				return;
			}
			query = "UPDATE bingo_settings set setting_value="+new_status+" where setting=\"is_active\"";
			result = await sql.syncQuery(query).catch(function(err)
			{
					this.error("query failed :(");
					this.res.writeHead(200, {'Content-Type': 'text/json'});
					this.res.end('{"error":"Request to update the bingo has failed."}');
					return;

			})
		}
		else if(params[1]=="reset")
		{
			query = "UPDATE bingo_cards set is_active=0;";
			result = await sql.syncQuery(query).catch(function(err)
			{
					this.error("query failed :(");
					this.res.writeHead(200, {'Content-Type': 'text/json'});
					this.res.end('{"error":"Request to update the bingo has failed."}');
					return;

			})
		}
		else
		{
			id = body.id;


			if(isNaN(id))
			{
				this.error("You don't seem to have sent a legit request to update/add an option");
				return;
			}
			if(params[1]=="enable")
			{
				query = "UPDATE bingo_options SET is_active=1 WHERE id="+id+";"
				result = await sql.syncQuery(query).catch(function(err)
				{
						this.error("query failed :(");
						this.res.writeHead(200, {'Content-Type': 'text/json'});
						this.res.end('{"error":"Request to update this square has failed."}');
						return;

				})
			}
			else if(params[1]=="disable")
			{
				query = "UPDATE bingo_options SET is_active=0 WHERE id="+id+";"
				result = await sql.syncQuery(query).catch(function(err)
				{
						this.error("query failed :(");
						this.res.writeHead(200, {'Content-Type': 'text/json'});
						this.res.end('{"error":"Request to update this square has failed."}');
						return;

				})
			}
			else if(params[1]=="update")
			{
				id = body.id;

				query = "";
				/*result = await sql.syncQuery(query).catch(function(err)
				{
						this.error("query failed :(");
						this.res.writeHead(200, {'Content-Type': 'text/json'});
						this.res.end('{"error":"request was a failure updating this quote"}');
						return;

				}).finally(()=>
				{

				});*/
			}
			else if(params[1]=="check")
			{
				checked = body.value;
				console.log(checked);
				query = "UPDATE bingo_options SET is_called="+checked+" WHERE id="+id+";"
				result = await sql.syncQuery(query).catch(function(err)
				{
						this.error("query failed :(");
						this.res.writeHead(200, {'Content-Type': 'text/json'});
						this.res.end('{"error":"Request to update this square has failed."}');
						return;

				})
			}
			else
			{

			}

		}
		this.end();

	},
	end:function()
	{
		this.res.writeHead(200, {'Content-Type': 'text/json'});
		this.res.end('{"success":"request was successful"}');
	},
	error:function(err)
	{
			this.res.writeHead(200, {'Content-Type': 'text/json'});
			this.res.end('{"error":"'+err+'"}');
	}
};

module.exports=admin;
