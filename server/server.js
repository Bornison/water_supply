const app = require("./app");

const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

/* ==========================================
   START SERVER
========================================== */

app.listen(PORT, () => {

    console.log("");

    console.log("===================================");

    console.log("🚀 Water Supply Server Started");

    console.log(`🌐 http://localhost:${PORT}`);

    console.log("===================================");

    console.log("");

});