const express=require("express");

const router=express.Router();

const reportController=require("../controllers/report.controller");

const {verifyToken}=require("../middleware/auth.middleware");

/* ==========================================
   ROUTES
========================================== */

router.get(

    "/daily",

    verifyToken,

    reportController.daily

);

router.get(

    "/monthly",

    verifyToken,

    reportController.monthly

);

router.get(

    "/range",

    verifyToken,

    reportController.dateRange

);

router.get(

    "/customers",

    verifyToken,

    reportController.customers

);

module.exports=router;