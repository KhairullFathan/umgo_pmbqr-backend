import crypto from "crypto";

export function verifyWahaHmac(req, res, next) {
  const signature = req.headers["x-webhook-hmac"];

  if (!signature) {
    return res.status(401).json({
      success: false,
      message: "Missing webhook signature"
    });
  }

  if (!req.rawBody) {
    return res.status(400).json({
      success: false,
      message: "Raw request body is missing"
    });
  }

  const secret = process.env.WEBHOOK_SECRET;

  if (!secret) {
    console.error("WEBHOOK_SECRET is not configured");

    return res.status(500).json({
      success: false,
      message: "Webhook security is not configured"
    });
  }

  const expectedSignature = crypto
    .createHmac("sha512", secret)
    .update(req.rawBody)
    .digest("hex");

  const received = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(received, expected)
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid webhook signature"
    });
  }

  next();
}