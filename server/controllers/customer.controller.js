const Customer = require("../models/customer.model");
const QRCode = require("qrcode");

/* ==========================================
   REGISTER CUSTOMER
========================================== */

async function register(req, res) {

    try {

        const customer = await Customer.createCustomer(req.body);

        const orderUrl = `${req.protocol}://${req.get("host")}/pages/customer-order.html?customerCode=${encodeURIComponent(customer.customer_code)}`;

        const qrImage = await QRCode.toDataURL(orderUrl);

        res.status(201).json({

            success: true,

            message: "Customer Registered Successfully.",

            customer,

            qr: qrImage,

            orderUrl

        });

    }


    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

}

/* ==========================================
   GET CUSTOMERS
========================================== */

async function getAll(req, res) {

    try {

        const customers = await Customer.getCustomers();

        res.json({

            success: true,

            data: customers

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
   GET CUSTOMER
========================================== */

async function getOne(req, res) {

    try {

        const customer = await Customer.getCustomer(req.params.id);

        res.json({

            success: true,

            data: customer

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
   UPDATE CUSTOMER
========================================== */

async function update(req, res) {

    try {

        const customer = await Customer.updateCustomer(

            req.params.id,

            req.body

        );

        res.json({

            success: true,

            message: "Customer Updated Successfully.",

            data: customer

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
   DELETE CUSTOMER
========================================== */

async function remove(req, res) {

    try {

        const id = Number(req.params.id);

        if (!id || !Number.isInteger(id) || id <= 0) {

            return res.status(400).json({

                success: false,

                message: "Invalid customer ID."

            });

        }

        const customer = await Customer.deleteCustomer(id);

        if (!customer) {

            return res.status(404).json({

                success: false,

                message: "Customer not found."

            });

        }

        res.json({

            success: true,

            message: "Customer deleted successfully.",

            data: customer

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

    register,

    getAll,

    getOne,

    update,

    remove

};
