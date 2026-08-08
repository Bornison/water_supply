const express = require("express");

const router = express.Router();

const customerController = require("../controllers/customer.controller");

const { verifyToken } = require("../middleware/auth.middleware");

/* ==========================================
   ROUTES
========================================== */

router.post(

    "/",

    verifyToken,

    customerController.register

);

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

module.exports = router;