const Report=require("../models/report.model");

/* ==========================================
   DAILY
========================================== */

async function daily(req,res){

    try{

        const report=await Report.getDailyReport();

        res.json({

            success:true,

            data:report

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
   MONTHLY
========================================== */

async function monthly(req,res){

    try{

        const report=await Report.getMonthlyReport();

        res.json({

            success:true,

            data:report

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
   DATE RANGE
========================================== */

async function dateRange(req,res){

    try{

        const {start,end}=req.query;

        const report=await Report.getDateRangeReport(

            start,

            end

        );

        res.json({

            success:true,

            data:report

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
   CUSTOMER STATS
========================================== */

async function customers(req,res){

    try{

        const report=await Report.getCustomerStatistics();

        res.json({

            success:true,

            data:report

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

    daily,

    monthly,

    dateRange,

    customers

};