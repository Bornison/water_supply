const Dashboard = require("../models/dashboard.model");

/* ==========================================
   GET DASHBOARD
========================================== */

async function getDashboard(req, res) {

    try {

        const summary = await Dashboard.getDashboardSummary();

        const recentOrders = await Dashboard.getRecentOrders();

        return res.status(200).json({

            success: true,

            summary,

            recentOrders

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

}

module.exports = {

    getDashboard

};