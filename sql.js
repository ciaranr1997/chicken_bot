const config = require("./config.json");

// Load module
var mysql = require('mysql');
// Initialize pool
var pool      =    mysql.createPool(config.mysql);
module.exports.pool = pool;
exports.syncQuery=function(query){

		return new Promise(function(resolve, reject){
			pool.getConnection(function(err,connection){
        if (err) {
          connection.release();
          throw err;
        }
        connection.query(query,function(err,rows){
            connection.release();
            if(!err) {
							rows = JSON.stringify(rows);
							rows = JSON.parse(rows);
							resolve(rows);
            }
        });
        connection.on('error', function(err) {
              throw err;
              return;
        });
    	});
		});
	}
exports.query = function(queryString, callback, params = [])
{
		pool.getConnection(function(err,connection){
      if (err) {
        connection.release();
        throw err;
      }
      connection.query(queryString, params,function(err,rows){
          connection.release();
          if(!err) {
						rows =JSON.stringify(rows);
						rows = JSON.parse(rows);
						callback(rows);
          }
      });
      connection.on('error', function(err) {
            throw err;
            return;
      });
  	});
}
exports.botQuery = function(queryString, callback,msg, params = [])
{
		pool.getConnection(function(err,connection){
      if (err) {
        connection.release();
        throw err;
      }
      connection.query(queryString, params,function(err,rows){
          connection.release();
          if(!err) {
						callback(msg,rows);
          }
      });
      connection.on('error', function(err) {
            throw err;
            return;
      });
  	});
}
exports.run = function(queryString, params = [])
{
		pool.getConnection(function(err,connection){
      if (err) {
        connection.release();
        throw err;
      }
      connection.query(queryString, params,function(err,rows){
          connection.release();
          if(!err) {
          }
      });
      connection.on('error', function(err) {
            throw err;
            return;
      });
  	});
}
exports.connect = function(){}//nothing here.. just for legacy while I clean up.
exports.close = function(){}
