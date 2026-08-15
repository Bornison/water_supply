const pool = require("../config/db");

/* ==========================================
   FIND USER BY USERNAME
========================================== */

async function findByUsername(username) {

    const query = `
        SELECT
            id,
            business_name,
            owner_name,
            username,
            password,
            phone,
            profile_picture
        FROM users
        WHERE LOWER(username) = LOWER($1)
        LIMIT 1
    `;

    const result = await pool.query(query, [username]);

    return result.rows[0];

}

module.exports = {

    findByUsername

};