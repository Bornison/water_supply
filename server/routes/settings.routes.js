const express=require("express");

const router=express.Router();

const settingsController=require("../controllers/settings.controller");

const {verifyToken}=require("../middleware/auth.middleware");

/* ==========================================
   ROUTES
========================================== */

router.get(

    "/",

    verifyToken,

    settingsController.get

);

router.put(

    "/business",

    verifyToken,

    settingsController.updateBusiness

);

router.put(

    "/owner",

    verifyToken,

    settingsController.updateOwner

);

module.exports=router;