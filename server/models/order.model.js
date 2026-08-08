const pool = require("../config/db");

/* ==========================================
   GET ALL ORDERS
========================================== */

async function getAllOrders() {

    const query = `

        SELECT

            o.id,

            o.order_number,

            o.status,

            o.remarks,

            o.ordered_at,

            o.delivered_at,

            c.id AS customer_id,

            c.customer_code,

            c.name,

            c.phone,

            c.address

        FROM orders o

        INNER JOIN customers c

        ON o.customer_id = c.id

        ORDER BY o.ordered_at DESC

    `;

    const result = await pool.query(query);

    return result.rows;

}

/* ==========================================
   GET PENDING ORDERS
========================================== */

async function getPendingOrders() {

    const query = `

        SELECT

            o.id,

            o.order_number,

            o.status,

            o.ordered_at,

            c.name,

            c.phone,

            c.address

        FROM orders o

        INNER JOIN customers c

        ON o.customer_id = c.id

        WHERE o.status='Pending'

        ORDER BY o.ordered_at ASC

    `;

    const result = await pool.query(query);

    return result.rows;

}

async function generateOrderNumber() {

    const query = `

        SELECT id

        FROM orders

        ORDER BY id DESC

        LIMIT 1

    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {

        return "ORD000001";

    }

    const nextId = Number(result.rows[0].id) + 1;

    return "ORD" + String(nextId).padStart(6, "0");

}

async function createCustomerOrder(customerId, items, emergency = false) {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const orderNumber = await generateOrderNumber();

        const insertOrderQuery = `

            INSERT INTO orders(

                order_number,

                customer_id,
                emergency

            )

            VALUES($1,$2,$3)

            RETURNING *

        `;

        const orderResult = await client.query(insertOrderQuery, [orderNumber, customerId, emergency]);

        const order = orderResult.rows[0];

        const insertItemQuery = `

            INSERT INTO order_items(

                order_id,

                product_id,

                quantity

            )

            VALUES($1,$2,$3)

            RETURNING *

        `;

        for (const item of items) {
            await client.query(insertItemQuery, [order.id, item.product_id, item.quantity]);
        }

        await client.query("COMMIT");

        return order;

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }

}

async function getOrderDetailsById(orderId) {

    const query = `

        SELECT

            o.id,

            o.order_number,

            o.status,

            o.emergency,

            o.remarks,

            o.ordered_at,

            o.delivered_at,

            c.id AS customer_id,

            c.customer_code,

            c.name AS customer_name,

            c.phone AS customer_phone,

            c.address AS customer_address,

            oi.product_id,

            p.product_name,

            p.volume,

            p.unit,

            oi.quantity

        FROM orders o

        INNER JOIN customers c ON o.customer_id = c.id

        INNER JOIN order_items oi ON oi.order_id = o.id

        INNER JOIN products p ON oi.product_id = p.id

        WHERE o.id=$1

    `;

    const result = await pool.query(query, [orderId]);

    if (result.rows.length === 0) {

        return null;

    }

    const row = result.rows[0];

    return {

        id: row.id,

        order_number: row.order_number,

        status: row.status,

        emergency: row.emergency,

        remarks: row.remarks,

        ordered_at: row.ordered_at,

        delivered_at: row.delivered_at,

        customer: {

            id: row.customer_id,

            customer_code: row.customer_code,

            name: row.customer_name,

            phone: row.customer_phone,

            address: row.customer_address

        },

        product: {

            id: row.product_id,

            name: row.product_name,

            volume: row.volume,

            unit: row.unit

        },

        quantity: row.quantity

    };

}

async function getOrderStatusById(orderId) {

    const query = `

        SELECT status, emergency

        FROM orders

        WHERE id=$1

    `;

    const result = await pool.query(query, [orderId]);

    return result.rows[0];

}

/* ==========================================
   GET ORDER HISTORY
========================================== */

async function getOrderHistory() {

    const query = `

        SELECT

            o.id,

            o.order_number,

            o.status,

            o.ordered_at,

            o.delivered_at,

            c.name,

            c.phone

        FROM orders o

        INNER JOIN customers c

        ON o.customer_id = c.id

        WHERE o.status='Delivered'

        ORDER BY o.delivered_at DESC

    `;

    const result = await pool.query(query);

    return result.rows;

}

/* ==========================================
   MARK DELIVERED
========================================== */

async function markDelivered(id) {

    const query = `

        UPDATE orders

        SET

            status='Delivered',

            delivered_at=CURRENT_TIMESTAMP

        WHERE id=$1

        RETURNING *

    `;

    const result = await pool.query(query,[id]);

    return result.rows[0];

}

module.exports={

    getAllOrders,

    getPendingOrders,

    getOrderHistory,

    markDelivered,

    generateOrderNumber,

    createCustomerOrder,

    getOrderDetailsById,

    getOrderStatusById

};
