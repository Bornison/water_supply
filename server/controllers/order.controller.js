const Order = require("../models/order.model");

/* ==========================================
   GET ORDERS (24-HOUR OPERATIONAL WINDOW OR ALL)
========================================== */
async function getOrders(req, res) {
    try {
        const isAll = req.query.all === "true" || req.query.period === "all";
        const orders = isAll ? await Order.getAllOrders() : await Order.getRecentOrders();
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

/* ==========================================
   GET PENDING ORDERS (24-HOUR WINDOW)
========================================== */
async function getPending(req, res) {
    try {
        const orders = await Order.getPendingOrders();
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

/* ==========================================
   GET DUE / UNPAID ORDERS (24-HOUR WINDOW)
========================================== */
async function getDue(req, res) {
    try {
        const orders = await Order.getDueOrders();
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

/* ==========================================
   GET ALL-TIME ORDER HISTORY (FOR HISTORY PAGE)
========================================== */
async function getAllHistory(req, res) {
    try {
        const orders = await Order.getAllOrders();
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

/* ==========================================
   GET DELIVERED HISTORY
========================================== */
async function getHistory(req, res) {
    try {
        const history = await Order.getOrderHistory();
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

/* ==========================================
   DELIVER & PAID
========================================== */
async function deliver(req, res) {
    try {
        const id = Number(req.params.id);
        if (!id || !Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }
        const order = await Order.markDelivered(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.json({
            success: true,
            message: "Order marked as Delivered & Paid",
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

/* ==========================================
   DELIVER BUT NOT PAY (DUE)
========================================== */
async function markDue(req, res) {
    try {
        const id = Number(req.params.id);
        if (!id || !Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }
        const order = await Order.markDue(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.json({
            success: true,
            message: "Order moved to Due List (Payment Pending)",
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    getOrders,
    getPending,
    getDue,
    getAllHistory,
    getHistory,
    deliver,
    markDue
};