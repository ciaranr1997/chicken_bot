module.exports = {
	schedule:function()
	{
		var fs = require("fs");
		var path = require("path");
		var read = fs.createReadStream(__dirname+"/movietemplate.txt","utf8");
		let template = '';
		read.on("data",function(chunk){
			template+=chunk	
		}).on("end",function(){
			
		});
	}
}