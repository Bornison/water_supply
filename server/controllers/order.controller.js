const Order=require("../models/order.model");

/* ==========================================
   GET ALL ORDERS
========================================== */

async function getOrders(req,res){

    try{

        const orders=await Order.getAllOrders();

        res.json({

            success:true,

            data:orders

        });

    }catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Internal Server Error"

        });

    }

}

/* ==========================================
   GET PENDING
========================================== */

async function getPending(req,res){

    try{

        const orders=await Order.getPendingOrders();

        res.json({

            success:true,

            data:orders

        });

    }catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Internal Server Error"

        });

    }

}

/* ==========================================
   HISTORY
========================================== */

async function getHistory(req,res){

    try{

        const history=await Order.getOrderHistory();

        res.json({

            success:true,

            data:history

        });

    }catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Internal Server Error"

        });

    }

}

/* ==========================================
   DELIVER
========================================== */

async function deliver(req,res){

    try{

        const id=req.params.id;

        const order=await Order.markDelivered(id);

        res.json({

            success:true,

            message:"Order Delivered",

            data:order

        });

    }catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Internal Server Error"

        });

    }

}

module.exports={

    getOrders,

    getPending,

    getHistory,

    deliver

};