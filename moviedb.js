const config = require("./config.json");
const https = require('https');
module.exports = {
    movieSearch:function(name,callback,year=null,msg)
    {


        source = 'https://api.themoviedb.org/3/search/movie?api_key='+config.movie_db_api+'&language=en-US&query='+name+'&page=1&include_adult=false';
        (year)? source+="&primary_release_year="+year : source;
        https.get(source, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

          // The whole response has been received. Print out the result.
          resp.on('end', () => {
            callback(JSON.parse(data),msg);
          });

        }).on("error", (err) => {
          console.log("Error: " + err.message);
        });
    },
    movieById:function(movieId,msg,callback)
    {
        source = "https://api.themoviedb.org/3/movie/"+movieId+"?api_key="+config.movie_db_api+"&language=en-US"
        https.get(source, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });


          resp.on('end', () => {
            callback(JSON.parse(data),msg);
          });

        }).on("error", (err) => {
          console.log("Error: " + err.message);
        });
    },
    getTrailer:async function(movieId,msg,callback)
    {
      source = "https://api.themoviedb.org/3/movie/"+movieId+"/videos?api_key="+config.movie_db_api+"&language=en-US"
      https.get(source, (resp) => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
          data += chunk;
      });


        resp.on('end', () => {
          json = JSON.parse(data);
          console.log(json);
          msg.reply("https://www.youtube.com/watch?v="+json.results[0].key);
        });

      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
    }
}
