import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";
import multer from "multer";

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

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  let stripeClient: Stripe | null = null;
  function getStripe() {
    if (!stripeClient) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        throw new Error("STRIPE_SECRET_KEY is missing");
      }
      stripeClient = new Stripe(key);
    }
    return stripeClient;
  }

  app.use(express.json());
  app.use("/uploads", express.static(uploadDir));

  // API Routes
  app.post("/api/upload", (req, res) => {
    try {
      upload.single("image")(req, res, (err: any) => {
        if (err) {
          console.error("Multer upload error:", err);
          return res.status(500).json({ error: err.message || "Multer upload failed" });
        }
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
        const url = `/uploads/${req.file.filename}`;
        res.json({ url });
      });
    } catch (err: any) {
      console.error("Multer runtime exception error:", err);
      res.status(500).json({ error: err.message || "Internal upload error" });
    }
  });

  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { items, shippingAddress } = req.body;
      const stripe = getStripe();

      // Calculate total on server (mock logic for demo, should query DB in production)
      // For this app, we'll use the price sent by client but validated against a theoretical fixed rate
      const subtotal = items.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
      const shipping = 25.00; // Fixed shipping rate
      const total = subtotal + shipping;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // convert to cents
        currency: "brl",
        payment_method_types: ["card", "pix"],
        metadata: {
          shipping_address: JSON.stringify(shippingAddress),
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        total: total,
      });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/instagram/alexalvjr", (req, res) => {
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

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global express error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
