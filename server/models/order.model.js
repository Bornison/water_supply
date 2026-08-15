const pool = require("../config/db");

/* ==========================================
   GET ALL ORDERS (COMPLETE HISTORY)
========================================== */
async function getAllOrders() {
    const query = `
        SELECT
            o.id,
            o.order_number,
            o.status,
            o.remarks,
            (CASE WHEN o.remarks ILIKE '%emergency%' THEN true ELSE false END) AS emergency,
            o.ordered_at,
            o.delivered_at,
            c.id AS customer_id,
            c.customer_code,
            c.name,
            c.phone,
            c.address,
            COALESCE(
                string_agg(concat(oi.quantity, 'x ', p.product_name), ', '),
                o.remarks,
                'Water Jar'
            ) AS product,
            COALESCE(SUM(oi.quantity), 1) AS quantity
        FROM orders o
        INNER JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON oi.product_id = p.id
        GROUP BY o.id, c.id
        ORDER BY o.ordered_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
}

/* ==========================================
   GET RECENT 24-HOUR ORDERS (FOR OPERATIONAL ORDERS PAGE)
========================================== */
async function getRecentOrders() {
    const query = `
        SELECT
            o.id,
            o.order_number,
            o.status,
            o.remarks,
            (CASE WHEN o.remarks ILIKE '%emergency%' THEN true ELSE false END) AS emergency,
            o.ordered_at,
            o.delivered_at,
            c.id AS customer_id,
            c.customer_code,
            c.name,
            c.phone,
            c.address,
            COALESCE(
                string_agg(concat(oi.quantity, 'x ', p.product_name), ', '),
                o.remarks,
                'Water Jar'
            ) AS product,
            COALESCE(SUM(oi.quantity), 1) AS quantity
        FROM orders o
        INNER JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.ordered_at >= (NOW() - INTERVAL '24 HOURS')
        GROUP BY o.id, c.id
        ORDER BY o.ordered_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
}

/* ==========================================
   GET PENDING ORDERS (24-HOUR WINDOW)
========================================== */
async function getPendingOrders() {
    const query = `
        SELECT
            o.id,
            o.order_number,
            o.status,
            o.remarks,
            (CASE WHEN o.remarks ILIKE '%emergency%' THEN true ELSE false END) AS emergency,
            o.ordered_at,
            c.id AS customer_id,
            c.customer_code,
            c.name,
            c.phone,
            c.address,
            COALESCE(
                string_agg(concat(oi.quantity, 'x ', p.product_name), ', '),
                o.remarks,
                'Water Jar'
            ) AS product,
            COALESCE(SUM(oi.quantity), 1) AS quantity
        FROM orders o
        INNER JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.status='Pending' AND o.ordered_at >= (NOW() - INTERVAL '24 HOURS')
        GROUP BY o.id, c.id
        ORDER BY o.ordered_at ASC
    `;
    const result = await pool.query(query);
    return result.rows;
}

/* ==========================================
   GET DUE / UNPAID ORDERS (24-HOUR WINDOW)
========================================== */
async function getDueOrders() {
    const query = `
        SELECT
            o.id,
            o.order_number,
            o.status,
            o.remarks,
            (CASE WHEN o.remarks ILIKE '%emergency%' THEN true ELSE false END) AS emergency,
            o.ordered_at,
            o.delivered_at,
            c.id AS customer_id,
            c.customer_code,
            c.name,
            c.phone,
            c.address,
            COALESCE(
                string_agg(concat(oi.quantity, 'x ', p.product_name), ', '),
                o.remarks,
                'Water Jar'
            ) AS product,
            COALESCE(SUM(oi.quantity), 1) AS quantity
        FROM orders o
        INNER JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.status='Due' AND o.ordered_at >= (NOW() - INTERVAL '24 HOURS')
        GROUP BY o.id, c.id
        ORDER BY o.delivered_at DESC, o.ordered_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
}

/* ==========================================
   GENERATE ORDER NUMBER
========================================== */
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

/* ==========================================
   CREATE CUSTOMER ORDER
========================================== */
async function createCustomerOrder(customerId, items, emergency = false) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const orderNumber = await generateOrderNumber();
        const remarksText = emergency ? "Emergency Order" : "Standard Order";
        const insertOrderQuery = `
            INSERT INTO orders(
                order_number,
                customer_id,
                remarks
            )
            VALUES($1, $2, $3)
            RETURNING *
        `;
        const orderResult = await client.query(insertOrderQuery, [orderNumber, customerId, remarksText]);
        const order = orderResult.rows[0];

        const insertItemQuery = `
            INSERT INTO order_items(
                order_id,
                product_id,
                quantity
            )
            VALUES($1, $2, $3)
            RETURNING *
        `;
        for (const item of items) {
            await client.query(insertItemQuery, [order.id, item.product_id, item.quantity]);
        }
        await client.query("COMMIT");
        return {
            ...order,
            emergency: Boolean(emergency)
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

/* ==========================================
   GET ORDER DETAILS BY ID
========================================== */
async function getOrderDetailsById(orderId) {
    const query = `
        SELECT
            o.id,
            o.order_number,
            o.status,
            o.remarks,
            (CASE WHEN o.remarks ILIKE '%emergency%' THEN true ELSE false END) AS emergency,
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
        WHERE o.id = $1
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

/* ==========================================
   GET ORDER STATUS BY ID
========================================== */
async function getOrderStatusById(orderId) {
    const query = `
        SELECT status, (CASE WHEN remarks ILIKE '%emergency%' THEN true ELSE false END) AS emergency
        FROM orders
        WHERE id = $1
    `;
    const result = await pool.query(query, [orderId]);
    return result.rows[0];
}

/* ==========================================
   GET ORDER HISTORY (DELIVERED ALL-TIME)
========================================== */
async function getOrderHistory() {
    const query = `
        SELECT
            o.id,
            o.order_number,
            o.status,
            o.remarks,
            (CASE WHEN o.remarks ILIKE '%emergency%' THEN true ELSE false END) AS emergency,
            o.ordered_at,
            o.delivered_at,
            c.id AS customer_id,
            c.customer_code,
            c.name,
            c.phone,
            c.address,
            COALESCE(
                string_agg(concat(oi.quantity, 'x ', p.product_name), ', '),
                o.remarks,
                'Water Jar'
            ) AS product,
            COALESCE(SUM(oi.quantity), 1) AS quantity
        FROM orders o
        INNER JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.status='Delivered'
        GROUP BY o.id, c.id
        ORDER BY o.delivered_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
}

/* ==========================================
   MARK DELIVERED (PAID)
========================================== */
async function markDelivered(id) {
    const query = `
        UPDATE orders
        SET
            status='Delivered',
            delivered_at=COALESCE(delivered_at, CURRENT_TIMESTAMP)
        WHERE id=$1
        RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

/* ==========================================
   MARK DELIVERED BUT NOT PAID (DUE)
========================================== */
async function markDue(id) {
    const query = `
        UPDATE orders
        SET
            status='Due',
            delivered_at=COALESCE(delivered_at, CURRENT_TIMESTAMP)
        WHERE id=$1
        RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

module.exports = {
    getAllOrders,
    getRecentOrders,
    getPendingOrders,
    getDueOrders,
    getOrderHistory,
    markDelivered,
    markDue,
    generateOrderNumber,
    createCustomerOrder,
    getOrderDetailsById,
    getOrderStatusById
};
