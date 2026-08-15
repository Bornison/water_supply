const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const { verifyToken } = require("../middleware/auth.middleware");

/* ==========================================
   CUSTOMER ROUTES
========================================== */

// Public Registration (Both Admin and Self-Registering Customers)
router.post(
    "/",
    customerController.register
);

router.post(
    "/register",
    customerController.register
);

// Protected Admin Endpoints
router.get(
    "/",
    verifyToken,
    customerController.getAll
);

router.get(
    "/:id",
    verifyToken,
    customerController.getOne
);

router.put(
    "/:id",
    verifyToken,
    customerController.update
);

router.delete(
    "/:id",
    verifyToken,
    customerController.remove
);

module.exports = router;