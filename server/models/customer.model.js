const pool = require("../config/db");

/* ==========================================
   GENERATE CUSTOMER CODE
========================================== */

async function generateCustomerCode() {

    const query = `

        SELECT id

        FROM customers

        ORDER BY id DESC

        LIMIT 1

    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {

        return "CUST000001";

    }

    const nextId = Number(result.rows[0].id) + 1;

    return "CUST" + String(nextId).padStart(6, "0");

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

        SELECT *

        FROM customers

        WHERE active = TRUE

        ORDER BY name ASC

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

module.exports = {

    createCustomer,

    getCustomers,

    getCustomer,

    findCustomerByCode,

    updateCustomer,

    generateCustomerCode

};