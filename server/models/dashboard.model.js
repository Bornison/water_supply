const pool = require("../config/db");

/* ==========================================
   DASHBOARD SUMMARY
========================================== */

async function getDashboardSummary() {

    const query = `

        SELECT

            (SELECT COUNT(*)
             FROM orders
             WHERE DATE(ordered_at)=CURRENT_DATE) AS today_orders,

            (SELECT COUNT(*)
             FROM orders
             WHERE status='Pending') AS pending_orders,

            (SELECT COUNT(*)
             FROM orders
             WHERE status='Delivered') AS delivered_orders,

            (SELECT COUNT(*)
             FROM customers
             WHERE active=TRUE) AS total_customers

    `;

    const result = await pool.query(query);

    return result.rows[0];

}

/* ==========================================
   RECENT ORDERS
========================================== */

async function getRecentOrders() {

    const query = `

        SELECT

            o.id,

            o.order_number,

            o.status,

            o.ordered_at,

            c.name AS customer_name,

            c.phone

        FROM orders o

        INNER JOIN customers c

        ON c.id = o.customer_id

        ORDER BY o.ordered_at DESC

        LIMIT 10

    `;

    const result = await pool.query(query);

    return result.rows;

}

module.exports = {

    getDashboardSummary,

    getRecentOrders

};