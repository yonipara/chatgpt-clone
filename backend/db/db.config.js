const mysql = require("mysql2");

// My database management system credential. Using promises instead of callbacks.
let DBMSconnection = mysql
  .createPool({
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true, // used for using several queries
  })
  .promise();

  module.exports = DBMSconnection;