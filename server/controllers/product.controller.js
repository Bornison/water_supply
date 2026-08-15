const Product=require("../models/product.model");

/* ==========================================
   GET PRODUCTS
========================================== */

async function getAll(req,res){

    try{

        const products=await Product.getProducts();

        res.json({

            success:true,

            data:products

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
   GET PRODUCT
========================================== */

async function getOne(req,res){

    try{

        const product=await Product.getProduct(

            req.params.id

        );

        res.json({

            success:true,

            data:product

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
   CREATE PRODUCT
========================================== */

async function create(req,res){

    try{

        const product=await Product.createProduct(

            req.body

        );

        res.status(201).json({

            success:true,

            message:"Product Created Successfully.",

            data:product

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
   UPDATE PRODUCT
========================================== */

async function update(req,res){

    try{

        const product=await Product.updateProduct(

            req.params.id,

            req.body

        );

        res.json({

            success:true,

            message:"Product Updated Successfully.",

            data:product

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
   ENABLE / DISABLE
========================================== */

async function changeStatus(req,res){

    try{

        const product=await Product.updateStatus(

            req.params.id,

            req.body.active

        );

        res.json({

            success:true,

            message:"Product Status Updated.",

            data:product

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
   DELETE PRODUCT
========================================== */

async function remove(req, res) {

    try {

        const id = Number(req.params.id);

        if (!id || !Number.isInteger(id) || id <= 0) {

            return res.status(400).json({

                success: false,

                message: "Invalid product ID."

            });

        }

        const product = await Product.deleteProduct(id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        res.json({

            success: true,

            message: "Product deleted successfully.",

            data: product

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

}

module.exports = {

    getAll,

    getOne,

    create,

    update,

    changeStatus,

    remove

};