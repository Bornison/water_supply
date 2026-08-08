const pool = require("../config/db");

/* ==========================================
   DAILY REPORT
========================================== */

async function getDailyReport() {

    const query = `

        SELECT

            COUNT(*) AS total_orders,

            COUNT(*) FILTER(

                WHERE status='Delivered'

            ) AS delivered_orders,

            COUNT(*) FILTER(

                WHERE status='Pending'

            ) AS pending_orders

        FROM orders

        WHERE DATE(ordered_at)=CURRENT_DATE

    `;

    const result = await pool.query(query);

    return result.rows[0];

}

/* ==========================================
   MONTHLY REPORT
========================================== */

async function getMonthlyReport() {

    const query = `

        SELECT

            COUNT(*) AS total_orders,

            COUNT(*) FILTER(

                WHERE status='Delivered'

            ) AS delivered_orders,

            COUNT(*) FILTER(

                WHERE status='Pending'

            ) AS pending_orders

        FROM orders

        WHERE DATE_TRUNC(

            'month',

            ordered_at

        ) = DATE_TRUNC(

            'month',

            CURRENT_DATE

        )

    `;

    const result = await pool.query(query);

    return result.rows[0];

}

/* ==========================================
   DATE RANGE REPORT
========================================== */

async function getDateRangeReport(start,end){

    const query=`

        SELECT

            *

        FROM orders

        WHERE DATE(ordered_at)

        BETWEEN $1 AND $2

        ORDER BY ordered_at DESC

    `;

    const result=await pool.query(query,[start,end]);

    return result.rows;

}

/* ==========================================
   CUSTOMER STATISTICS
========================================== */

async function getCustomerStatistics(){

    const query=`

        SELECT

            c.id,

            c.customer_code,

            c.name,

            COUNT(o.id) AS total_orders

        FROM customers c

        LEFT JOIN orders o

        ON o.customer_id=c.id

        GROUP BY

            c.id,

            c.customer_code,

            c.name

        ORDER BY total_orders DESC

    `;

    const result=await pool.query(query);

    return result.rows;

}

module.exports={

    getDailyReport,

    getMonthlyReport,

    getDateRangeReport,

    getCustomerStatistics

};