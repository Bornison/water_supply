const express = require("express");
const router = express.Router();
const customerOrderController = require("../controllers/customer-order.controller");

/* ==========================================
   CUSTOMER ORDER ROUTES
========================================== */
router.get(
    "/default-customer",
    customerOrderController.getDefaultCustomer
);

router.get(
    "/customer/:customerCode",
    customerOrderController.getCustomerByCode
);

router.get(
    "/products",
    customerOrderController.getProducts
);

router.post(
    "/orders",
    customerOrderController.createOrder
);

router.get(
    "/orders/:orderId",
    customerOrderController.getOrderDetails
);

router.get(
    "/orders/:orderId/status",
    customerOrderController.getOrderStatus
);

module.exports = router;
