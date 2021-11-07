var formidable = require('formidable');
var fs = require('fs');

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
		var form = new formidable.IncomingForm();
    form.parse(this.req, function (err, fields, files) {
			var oldpath = files.file.path;
			var newpath = './assets/' + files.file.name;
			var dir="";
			if(files.file.type.includes("image"))
			{
				dir="images/";
			}
			if(files.file.type.includes("video"))
			{
				dir="videos/";
			}
			if(files.file.type.includes("audio"))
			{
				dir="audio/";
			}
			var newpath = './assets/'+dir + files.file.name;
			fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;

      });
    });
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
