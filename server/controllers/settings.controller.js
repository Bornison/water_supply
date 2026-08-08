const Settings=require("../models/settings.model");

/* ==========================================
   GET SETTINGS
========================================== */

async function get(req,res){

    try{

        const settings=await Settings.getSettings();

        res.json({

            success:true,

            data:settings

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Internal Server Error"

        });

    }

}

/* ==========================================
   UPDATE BUSINESS
========================================== */

async function updateBusiness(req,res){

    try{

        const data=await Settings.updateBusiness(req.body);

        res.json({

            success:true,

            message:"Business Updated Successfully.",

            data

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Internal Server Error"

        });

    }

}

/* ==========================================
   UPDATE OWNER
========================================== */

async function updateOwner(req,res){

    try{

        const data=await Settings.updateOwner(req.body);

        res.json({

            success:true,

            message:"Owner Updated Successfully.",

            data

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Internal Server Error"

        });

    }

}

module.exports={

    get,

    updateBusiness,

    updateOwner

};