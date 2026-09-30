import "dotenv/config";

import express from "express";

import indexRoutes from "./routes/index.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import {sequelize} from "./config/database.js"

const app = express();

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0"

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/", indexRoutes);
app.use("/webhook", webhookRoutes);

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/


async function startServer() { 
  try { 
    // ======================================== 
    // DATABASE STARTUP CHECK 
    // ======================================== 
    console.log("Checking database connection...") 
    await sequelize.authenticate()
    console.log("Database connection: SUCCESS"); 
    // ======================================== 
    // START HTTP SERVER 
    // ======================================== 
    const server = app.listen(PORT, HOST, () => { 
      console.log(` 
======================================== 
WhatsApp Bot Backend 
======================================== 
Environment : ${process.env.NODE_ENV || "development"} 
Host : ${HOST} 
Port : ${PORT} 
WAHA : ${process.env.WAHA_URL} 
Session : ${process.env.WAHA_SESSION} 
Database : CONNECTED 
======================================== 
Server is running... 
======================================== 
      `)
    }) 
    // ======================================== 
    // SERVER ERROR 
    // ======================================== 
    server.on("error", (error) => { 
      console.error("========================================")
      console.error(" Failed to start server")
      console.error("========================================")
      console.error(error); process.exit(1)
    }); 
  } catch (error) { 
    console.error("========================================")
    console.error(" Database connection: FAILED"); 
    console.error("========================================")
    console.error(error.message)
    process.exit(1)
  } 
} 
startServer()