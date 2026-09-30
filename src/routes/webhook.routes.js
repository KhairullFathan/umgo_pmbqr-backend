import { Router } from "express";
import { handleWahaWebhook } from "../controllers/webhook.controller.js";
import { verifyWahaHmac } from "../middleware/waha-hmac.middleware.js"

const router = Router();

router.post("/waha", verifyWahaHmac, handleWahaWebhook);

export default router;