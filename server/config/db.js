const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({

    host: process.env.DB_HOST,

    port: process.env.DB_PORT,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME

});

/* ==========================================
   DATABASE CONNECTION TEST
========================================== */

pool.connect((error, client, release) => {

    if (error) {

        console.error("❌ PostgreSQL Connection Failed");

        console.error(error.message);

        return;

    }
    console.log("✅ PostgreSQL Connected");


    release();

});

module.exports = pool;