const express=require("express");

const router=express.Router();

const orderController=require("../controllers/order.controller");

const {verifyToken}=require("../middleware/auth.middleware");

/* ==========================================
   ROUTES
========================================== */

router.get(

    "/",

    verifyToken,

    orderController.getOrders

);

router.get(

    "/pending",

    verifyToken,

    orderController.getPending

);

router.get(

    "/history",

    verifyToken,

    orderController.getHistory

);

router.put(

    "/:id/deliver",

    verifyToken,

    orderController.deliver

);

module.exports=router;