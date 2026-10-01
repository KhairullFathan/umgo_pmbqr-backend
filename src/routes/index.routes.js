import { Router } from "express";
// import { getSessions } from "../services/waha.service.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "WhatsApp Bot Backend is running"
  });
});

// router.get("/health", async (req, res) => {
//   try {
//     const sessions = await getSessions();

//     res.json({
//       success: true,
//       backend: "UP",
//       waha: "UP",
//       sessions
//     });

//   } catch (error) {
//     console.error(error.message);

//     res.status(503).json({
//       success: false,
//       backend: "UP",
//       waha: "DOWN",
//       error: error.message
//     });
//   }
// });


export default router;