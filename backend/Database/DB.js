const mysql = require("mysql2/promise");
const config = require("./DBConfig");

async function query(sql, params) {
  try {
    const connection = await mysql.createConnection(config.db);
    const [results] = await connection.execute(sql, params);

    return results;
  } catch (error) {
    console.log("Database error", error);
  }
}

// async function selectOne(sql) {

// }

module.exports = {
  query,
};
