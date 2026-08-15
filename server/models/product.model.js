const pool = require("../config/db");

/* ==========================================
   GET PRODUCTS
========================================== */

async function getProducts() {

    const query = `

        SELECT *

        FROM products

        ORDER BY volume DESC

    `;

    const result = await pool.query(query);

    return result.rows;

}

async function getActiveCustomerProducts() {

    const query = `

        SELECT *

        FROM products

        WHERE active = TRUE

        ORDER BY volume DESC

    `;

    const result = await pool.query(query);

    return result.rows;

}

/* ==========================================
   GET PRODUCT
========================================== */

async function getProduct(id) {

    const query = `

        SELECT *

        FROM products

        WHERE id = $1

    `;

    const result = await pool.query(query,[id]);

    return result.rows[0];

}

/* ==========================================
   CREATE PRODUCT
========================================== */

async function createProduct(product) {

    const query = `

        INSERT INTO products(

            product_name,

            volume,

            unit,

            active

        )

        VALUES($1,$2,$3,$4)

        RETURNING *

    `;

    const values=[

        product.product_name,

        product.volume,

        product.unit,

        true

    ];

    const result=await pool.query(query,values);

    return result.rows[0];

}

/* ==========================================
   UPDATE PRODUCT
========================================== */

async function updateProduct(id,product){

    const query=`

        UPDATE products

        SET

            product_name=$1,

            volume=$2,

            unit=$3

        WHERE id=$4

        RETURNING *

    `;

    const values=[

        product.product_name,

        product.volume,

        product.unit,

        id

    ];

    const result=await pool.query(query,values);

    return result.rows[0];

}

/* ==========================================
   ENABLE / DISABLE PRODUCT
========================================== */

async function updateStatus(id,active){

    const query=`

        UPDATE products

        SET active=$1

        WHERE id=$2

        RETURNING *

    `;

    const result=await pool.query(query,[active,id]);

    return result.rows[0];

}

/* ==========================================
   DELETE PRODUCT
========================================== */

async function deleteProduct(id) {

    const query = `

        DELETE FROM products

        WHERE id = $1

        RETURNING *

    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

}

module.exports = {

    getProducts,

    getActiveCustomerProducts,

    getProduct,

    createProduct,

    updateProduct,

    updateStatus,

    deleteProduct

};