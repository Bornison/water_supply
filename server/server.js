const app = require("./app");

const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

/* ==========================================
   START SERVER
========================================== */

const server = app.listen(PORT, () => {
    console.log("");
    console.log("===================================");
    console.log("🚀 Water Supply Server Started");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("===================================");
    console.log("");
});

server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(`❌ Error: Port ${PORT} is already in use by another process.`);
        console.error(`👉 Please close any other running instances or processes on port ${PORT}.`);
    } else {
        console.error("❌ Server Error:", error.message);
    }
    process.exit(1);
});