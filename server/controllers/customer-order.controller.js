const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const pool = require("../config/db");

/* ==========================================
   GET CUSTOMER BY CODE
========================================== */
async function getCustomerByCode(req, res) {
    try {
        const customerCode = req.params.customerCode;

        if (!customerCode || customerCode.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Customer code is required"
            });
        }

        const customer = await Customer.findCustomerByCode(customerCode.trim());

        if (!customer || !customer.active) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        return res.json({
            success: true,
            data: {
                id: customer.id,
                customer_code: customer.customer_code,
                name: customer.name,
                phone: customer.phone,
                address: customer.address
            }
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
   GET ACTIVE PRODUCTS
========================================== */
async function getProducts(req, res) {
    try {
        const products = await Product.getActiveCustomerProducts();
        res.json({
            success: true,
            data: products
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
   CREATE ORDER
========================================== */
async function createOrder(req, res) {
    try {
        const { customer_id, product_id, quantity, items, emergency = false } = req.body;
        const customerId = Number(customer_id);
        const requestedItems = Array.isArray(items) && items.length
            ? items
            : [{ product_id, quantity }];

        if (!customerId || !Number.isInteger(customerId) || customerId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer_id"
            });
        }

        const normalizedItems = requestedItems.map(item => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity)
        }));

        if (!normalizedItems.length || normalizedItems.some(item => !Number.isInteger(item.product_id) || item.product_id <= 0 || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
            return res.status(400).json({ success: false, message: "Each order item requires a valid product_id and quantity" });
        }

        const customer = await Customer.getCustomer(customerId);
        if (!customer || !customer.active) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        for (const item of normalizedItems) {
            const product = await Product.getProduct(item.product_id);
            if (!product || !product.active) {
                return res.status(404).json({ success: false, message: "Product not found or inactive" });
            }
        }

        const order = await Order.createCustomerOrder(customerId, normalizedItems, Boolean(emergency));

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: {
                order_id: order.id,
                order_number: order.order_number,
                customer_id: order.customer_id,
                items: normalizedItems,
                emergency: order.emergency,
                status: order.status,
                ordered_at: order.ordered_at
            }
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
   GET ORDER DETAILS
========================================== */
async function getOrderDetails(req, res) {
    try {
        const orderId = Number(req.params.orderId);
        if (!orderId || !Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.getOrderDetailsById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
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
   GET ORDER STATUS
========================================== */
async function getOrderStatus(req, res) {
    try {
        const orderId = Number(req.params.orderId);
        if (!orderId || !Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.getOrderStatusById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            data: {
                status: order.status
            }
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
   GET DEFAULT / LATEST ACTIVE CUSTOMER
========================================== */
async function getDefaultCustomer(req, res) {
    try {
        const query = `
            SELECT id, customer_code, name, phone, address
            FROM customers
            WHERE active = TRUE
            ORDER BY id DESC
            LIMIT 1
        `;
        const result = await pool.query(query);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active customer found"
            });
        }
        res.json({
            success: true,
            data: result.rows[0]
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
    getCustomerByCode,
    getProducts,
    createOrder,
    getOrderDetails,
    getOrderStatus,
    getDefaultCustomer
};
