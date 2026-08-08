const pool = require("../config/db");

/* ==========================================
   GET SETTINGS
========================================== */

async function getSettings() {

    const query = `

        SELECT

            bs.*,

            u.owner_name,

            u.username,

            u.phone AS owner_phone,

            u.profile_picture

        FROM business_settings bs

        CROSS JOIN users u

        LIMIT 1

    `;

    const result = await pool.query(query);

    return result.rows[0];

}

/* ==========================================
   UPDATE BUSINESS
========================================== */

async function updateBusiness(data){

    const query=`

        UPDATE business_settings

        SET

            business_name=$1,

            phone=$2,

            email=$3,

            address=$4,

            logo=$5,

            theme_color=$6,

            updated_at=CURRENT_TIMESTAMP

        WHERE id=1

        RETURNING *

    `;

    const values=[

        data.business_name,

        data.phone,

        data.email,

        data.address,

        data.logo,

        data.theme_color

    ];

    const result=await pool.query(query,values);

    return result.rows[0];

}

/* ==========================================
   UPDATE OWNER
========================================== */

async function updateOwner(data){

    const query=`

        UPDATE users

        SET

            owner_name=$1,

            username=$2,

            phone=$3,

            profile_picture=$4,

            updated_at=CURRENT_TIMESTAMP

        WHERE id=1

        RETURNING *

    `;

    const values=[

        data.owner_name,

        data.username,

        data.phone,

        data.profile_picture

    ];

    const result=await pool.query(query,values);

    return result.rows[0];

}

module.exports={

    getSettings,

    updateBusiness,

    updateOwner

};