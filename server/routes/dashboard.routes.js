const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");

const { verifyToken } = require("../middleware/auth.middleware");

/* ==========================================
   DASHBOARD
========================================== */

router.get(

    "/",

    verifyToken,

    dashboardController.getDashboard

);

module.exports = router;