const crypto = require("crypto");
const pool = require("../config/db");

/* ==========================================
   GENERATE RANDOM CUSTOMER CODE
========================================== */

function generateRandomCode(length = 6) {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Clean alphanumeric uppercase
    let result = "";
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        result += chars[randomBytes[i] % chars.length];
    }
    return `CUST${result}`;
}

async function generateCustomerCode() {
    let isUnique = false;
    let code = "";
    let attempts = 0;

    while (!isUnique && attempts < 10) {
        code = generateRandomCode(6);
        const checkQuery = `SELECT id FROM customers WHERE customer_code = $1 LIMIT 1`;
        const result = await pool.query(checkQuery, [code]);
        if (result.rows.length === 0) {
            isUnique = true;
        }
        attempts++;
    }

    return code;
}

/* ==========================================
   REGISTER CUSTOMER
========================================== */

async function createCustomer(customer) {

    const customerCode = await generateCustomerCode();

    const query = `

        INSERT INTO customers(

            customer_code,

            name,

            phone,

            address,

            latitude,

            longitude

        )

        VALUES($1,$2,$3,$4,$5,$6)

        RETURNING *

    `;

    const values = [

        customerCode,

        customer.name,

        customer.phone,

        customer.address,

        customer.latitude,

        customer.longitude

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

}

/* ==========================================
   GET CUSTOMERS
========================================== */

async function getCustomers() {

    const query = `

        SELECT
            c.*,
            COALESCE(COUNT(o.id), 0) AS total_orders,
            COALESCE(COUNT(CASE WHEN o.status = 'Pending' THEN 1 END), 0) AS pending_orders,
            MAX(o.ordered_at) AS last_order_date
        FROM customers c
        LEFT JOIN orders o ON o.customer_id = c.id
        WHERE c.active = TRUE
        GROUP BY c.id
        ORDER BY c.name ASC

    `;

    const result = await pool.query(query);

    return result.rows;

}


/* ==========================================
   GET CUSTOMER
========================================== */

async function getCustomer(id) {

    const result = await pool.query(

        `SELECT * FROM customers WHERE id=$1`,

        [id]

    );

    return result.rows[0];

}

/* ==========================================
   GET CUSTOMER BY CODE
========================================== */

async function findCustomerByCode(customerCode) {

    const result = await pool.query(

        `SELECT * FROM customers WHERE customer_code=$1`,

        [customerCode]

    );

    return result.rows[0];

}

/* ==========================================
   UPDATE CUSTOMER
========================================== */

async function updateCustomer(id, customer) {

    const query = `

        UPDATE customers

        SET

            name=$1,

            phone=$2,

            address=$3,

            latitude=$4,

            longitude=$5,

            updated_at=CURRENT_TIMESTAMP

        WHERE id=$6

        RETURNING *

    `;

    const values = [

        customer.name,

        customer.phone,

        customer.address,

        customer.latitude,

        customer.longitude,

        id

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

}

async function deleteCustomer(id) {

    const query = `

        UPDATE customers

        SET active = FALSE,

            updated_at = CURRENT_TIMESTAMP

        WHERE id = $1

        RETURNING *

    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

}

module.exports = {

    createCustomer,

    getCustomers,

    getCustomer,

    findCustomerByCode,

    updateCustomer,

    deleteCustomer,

    generateCustomerCode

};