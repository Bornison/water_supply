const Customer = require("../models/customer.model");
const QRCode = require("qrcode");

/* ==========================================
   REGISTER CUSTOMER
========================================== */

async function register(req, res) {

    try {

        const customer = await Customer.createCustomer(req.body);

        const qrData = customer.customer_code;

        const qrImage = await QRCode.toDataURL(qrData);

        res.status(201).json({

            success: true,

            message: "Customer Registered Successfully.",

            customer,

            qr: qrImage

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

module.exports = {

    register,

    getAll,

    getOne,

    update

};