const mysql = require('mysql') ;
const dbConfig = require("../config/db.config.js");

const con = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
  });
  
 con.connect(function(err) {  
    if (err) throw err;  
    console.log("Connected!");  
}); 

const query=(sql,val) => {
    return new Promise((resolve,reject) => {
      con.query(sql, val, function (err, result) {  
        if (err) throw err;  
        console.log("EXECUTED");
        resolve(result); 
      });
    });
  }

module.exports = query;