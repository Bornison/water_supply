const pool = require("../config/db");

/* ==========================================
   FIND USER BY USERNAME (STRICT CASE-SENSITIVE)
========================================== */
async function findByUsername(username) {
    if (typeof username !== "string" || !username) {
        return null;
    }

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
        WHERE username = $1
        LIMIT 1
    `;

    const result = await pool.query(query, [username]);
    const user = result.rows[0];

    if (!user || user.username !== username) {
        return null;
    }

    return user;
}

module.exports = {
    findByUsername
};