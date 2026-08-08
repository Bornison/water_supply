const express=require("express");

const router=express.Router();

const productController=require("../controllers/product.controller");

const {verifyToken}=require("../middleware/auth.middleware");

/* ==========================================
   ROUTES
========================================== */

router.get(

    "/",

    verifyToken,

    productController.getAll

);

router.get(

    "/:id",

    verifyToken,

    productController.getOne

);

router.post(

    "/",

    verifyToken,

    productController.create

);

router.put(

    "/:id",

    verifyToken,

    productController.update

);

router.patch(

    "/:id/status",

    verifyToken,

    productController.changeStatus

);

module.exports=router;