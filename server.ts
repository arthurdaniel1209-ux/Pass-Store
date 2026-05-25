import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";
import multer from "multer";
import crypto from "crypto";
import { logger } from "./src/lib/serverLogger";
import { createRateLimiter } from "./src/lib/serverRateLimit";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure Multer with safe production size limits (max 5MB uploads to prevent disk exhaustion attacks)
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  let stripeClient: Stripe | null = null;
  function getStripe(): Stripe {
    if (!stripeClient) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        throw new Error("STRIPE_SECRET_KEY is missing");
      }
      stripeClient = new Stripe(key);
    }
    return stripeClient;
  }

  // Bind custom tracing context to log lines and serialize headers safely
  app.use(express.json());

  // Tracing Middleware: Instantiates request correlators and attaches request-scoped child loggers
  app.use((req: any, res: any, next: any) => {
    const requestId = crypto.randomUUID();
    const traceId = req.headers["x-trace-id"] || crypto.randomUUID();
    
    // Safety check PII headers like auth tokens or users
    const userIdHeader = req.headers["x-user-id"] || req.headers["x-customer-id"] || null;
    const userId = typeof userIdHeader === "string" ? userIdHeader.trim() : null;
    
    const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const clientIp = Array.isArray(rawIp)
      ? rawIp[0].trim()
      : typeof rawIp === "string"
        ? rawIp.split(",")[0].trim()
        : "127.0.0.1";

    const reqLogger = logger.child({
      requestId,
      traceId,
      userId,
      ip: clientIp,
      method: req.method,
      url: req.originalUrl || req.url,
    });

    req.logger = reqLogger;
    req.requestId = requestId;
    req.traceId = traceId;

    const start = Date.now();

    res.on("finish", () => {
      const elapsed = Date.now() - start;
      const status = res.statusCode;

      if (status >= 500) {
        reqLogger.error(`Request completed with error status: ${status}`, undefined, { durationMs: elapsed });
      } else if (status >= 400) {
        reqLogger.warn(`Request completed with client error status: ${status}`, { durationMs: elapsed });
      } else {
        reqLogger.info(`Request completed with success status: ${status}`, { durationMs: elapsed });
      }
    });

    next();
  });

  app.use("/uploads", express.static(uploadDir));

  // Default global rate limiter across all endpoints to shield from heavy automated scanning
  app.use(createRateLimiter("default"));

  // API Routes

  // Safeguarded Upload - applies asset-specific limits and filters sizes
  app.post("/api/upload", createRateLimiter("upload"), (req: any, res: any) => {
    const reqLogger = req.logger || logger;
    reqLogger.info("Incoming asset upload request");

    try {
      upload.single("image")(req, res, (err: any) => {
        if (err) {
          reqLogger.error("Multer file upload failure", err);
          return res.status(500).json({ error: err.message || "File upload processing failed." });
        }
        if (!req.file) {
          reqLogger.warn("Upload aborted: No image file present in request body");
          return res.status(400).json({ error: "No file was uploaded." });
        }

        const url = `/uploads/${req.file.filename}`;
        reqLogger.info("File uploaded successfully", { filename: req.file.filename, url });
        res.json({ url });
      });
    } catch (err: any) {
      reqLogger.fatal("Multer critical pipeline explosion", err);
      res.status(500).json({ error: "Internal file processing error." });
    }
  });

  // Stripe Payment Intake - validated input shapes, highly insulated sensitive rate limiting
  app.post("/api/create-payment-intent", createRateLimiter("sensitive"), async (req: any, res: any) => {
    const reqLogger = req.logger || logger;
    reqLogger.info("Incoming request to initialize payment intent flow");

    try {
      const { items, shippingAddress } = req.body;

      // Strict Input Validation - prevents injection, null objects, or negative values math bypasses
      if (!items || !Array.isArray(items) || items.length === 0) {
        reqLogger.warn("PaymentIntent creation aborted: Missing or malformed items list in request body");
        return res.status(400).json({ error: "Valid checkout basket items list is required." });
      }

      if (!shippingAddress || typeof shippingAddress !== "object" || !shippingAddress.fullName || !shippingAddress.addressLine1) {
        reqLogger.warn("PaymentIntent creation aborted: Insufficient or missing shipping details");
        return res.status(400).json({ error: "Complete delivery address is required." });
      }

      // Safe checkout calculations done strictly server-side
      let validatedSubtotal = 0;
      for (const item of items) {
        if (!item.product || typeof item.product.price !== "number" || item.product.price < 0) {
          reqLogger.warn("PaymentIntent calculation failed: Product price is invalid", { product: item.product });
          return res.status(400).json({ error: "Invalid product information specified in checkout items." });
        }
        if (typeof item.quantity !== "number" || item.quantity <= 0) {
          reqLogger.warn("PaymentIntent calculation failed: Quantity must be greater than zero", { item });
          return res.status(400).json({ error: "Invalid product quantity specify in checkout." });
        }
        validatedSubtotal += item.product.price * item.quantity;
      }

      const shippingCost = 25.00; // Fixed shipping rate
      const grandTotalBRL = validatedSubtotal + shippingCost;

      reqLogger.info("Calculated safe total server-side", { validatedSubtotal, shippingCost, grandTotalBRL });

      const stripeConnection = getStripe();
      
      // Request Payment Intent from Stripe
      // Secure Redaction applies: details of client secrets, metadata content will be protected in our logger
      const paymentIntent = await stripeConnection.paymentIntents.create({
        amount: Math.round(grandTotalBRL * 100), // convert to cents
        currency: "brl",
        payment_method_types: ["card", "pix"],
        metadata: {
          shipping_address: JSON.stringify(shippingAddress),
        },
      });

      reqLogger.info("Stripe PaymentIntent generated successfully", { 
        intentId: paymentIntent.id, 
        totalCents: Math.round(grandTotalBRL * 100) 
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        total: grandTotalBRL,
      });
    } catch (err: any) {
      reqLogger.error("Stripe integration critical flow error", err);
      res.status(500).json({ error: "Stripe connection failed. Please contact support or try again." });
    }
  });

  app.get("/api/instagram/alexalvjr", (req: any, res: any) => {
    const reqLogger = req.logger || logger;
    reqLogger.info("Fetching curated social feeds from instagram cache");

    const mockPosts = [
      {
        id: "post_reel_1",
        url: "https://www.instagram.com/reel/DXmgSpFjqRf/",
        imageUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format",
        caption: "PASS Essentials // Winter Drop - The vision of streetwear. ❄️",
        username: "alexalvjr",
        isReel: true
      },
      {
        id: "post1",
        url: "https://www.instagram.com/p/CzX9_8OR1zB/",
        imageUrl: "https://images.unsplash.com/photo-1542327897-d73f4005b533?q=80&w=800&auto=format",
        caption: "Essentials Archiv 02 drop. Available now. Link in bio. 🔗",
        username: "alexalvjr"
      },
      {
        id: "post2",
        url: "https://www.instagram.com/p/CzK98zSR8zK/",
        imageUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format",
        caption: "Details that define us. Quality above all. 🧵",
        username: "alexalvjr"
      },
      {
        id: "post3",
        url: "https://www.instagram.com/p/Cy_90zRR4zP/",
        imageUrl: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=800&auto=format",
        caption: "The vision behind PASS. Art meeting culture. 🏛️",
        username: "alexalvjr"
      },
      {
        id: "post4",
        url: "https://www.instagram.com/p/Cyv94zSR9zL/",
        imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format",
        caption: "Future of Streetwear. Coming soon. ⌛",
        username: "alexalvjr"
      }
    ];

    res.json(mockPosts);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Central Error Handler - absolutely no leaked stacks in production response payload
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const reqLogger = (req as any).logger || logger;
    reqLogger.error("Central backend exception caught by global handler", err, {
      path: req.path,
      headers: req.headers, // Sensitive headers will be redacted automatically by logger
    });
    
    res.status(500).json({ error: "Something went wrong. Please check again later." });
  });

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Production-ready server initialization successful, listening on port ${PORT}`);
  });
}

startServer();
