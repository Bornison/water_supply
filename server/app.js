require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const orderRoutes=require("./routes/order.routes");
const customerRoutes = require("./routes/customer.routes");
const customerOrderRoutes = require("./routes/customer-order.routes");
const productRoutes=require("./routes/product.routes");
const settingsRoutes=require("./routes/settings.routes");
const reportRoutes=require("./routes/report.routes");

const app = express();

/* ==========================================
   MIDDLEWARE
========================================== */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(

    "/api/orders",

    orderRoutes

);
app.use(

    "/api/customers",

    customerRoutes

);
app.use(

    "/api/products",

    productRoutes

);
app.use(

    "/api/customer-order",

    customerOrderRoutes

);
app.use(

    "/api/settings",

    settingsRoutes

);
app.use(

    "/api/reports",

    reportRoutes

);

/* ==========================================
   ROUTES
========================================== */

app.get("/", (req, res) => {

    res.json({

        success: true,

        message: "Water Supply API Running"

    });

});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;