import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import Stripe from "stripe";
import Zip from "adm-zip";
import dotenv from "dotenv";

dotenv.config();

let stripeClient: Stripe | null = null;
const getStripe = () => {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia" as any,
    });
  }
  return stripeClient;
};

// Persistent Database via db.json
const DB_FILE = path.join(process.cwd(), "db.json");

const defaultDb = {
  config: {
    homeBanners: [
      "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&q=80&w=1600"
    ],
    physicalBanner: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1600",
    onlineBanner: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=1600",
  },
  courses: [
    {
      id: "phy-1",
      type: "physical",
      title: "【寒假營隊】AI 小小程式設計師與機器人創客營",
      category: "冬令營 / 實體活動",
      price: 9800,
      description: "透過圖像化積木與 AI 工具，引導孩子親手組裝機器人，培養邏輯思維與運算思維。",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
      tags: ["AI 啟蒙", "機器人", "小學 1-6 年級"],
      location: "台北市大安區教育中心",
      duration: "5 天全日營",
      startDate: "2025-01-20",
      endDate: "2025-01-24",
      details: "本課程旨在帶領學童建立運算思維，透過互動遊戲、實體積木機器人組裝及基礎 AI 提示語設計，激發創意思維。"
    },
    {
      id: "phy-2",
      type: "physical",
      title: "【週末實體】創意 AI 繪圖與定格動畫工作坊",
      category: "週末常態班",
      price: 4500,
      description: "讓孩子學習用 AI 工具生成故事角色，並結合手作與黏土製作屬於自己的微電影定格動畫。",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800",
      tags: ["AI 繪圖", "動畫製作", "創意美學"],
      location: "新北市板橋教室",
      duration: "4 週（每週六上午）",
      startDate: "2025-03-01",
      endDate: "2025-03-22",
      details: "融合科技與美術，教導小朋友如何正確運用 AI 圖像生成激發靈感，並動手捏製角色完成故事分鏡與動畫短片。"
    },
    {
      id: "on-1",
      type: "online",
      title: "【線上月訂閱】孩子的第一堂 AI 創意故事寫作課",
      category: "線上訂閱",
      price: 599,
      description: "每週解鎖全新主題，引導孩子與 AI 共同創作奇幻故事、漫畫分鏡，提升寫作表達力！",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
      tags: ["每月扣款", "隨時觀看", "作業批改"],
      duration: "每月 4 堂影音 + 實作回饋",
      details: "專為國小與國中生設計的 AI 輔助寫作課，包含寫作結構、詞彙聯想、AI 引導角色對話等，每堂課皆有專業助教批改與回饋。"
    },
    {
      id: "on-2",
      type: "online",
      title: "【線上月訂閱】Scratch + AI 幼兒趣味遊戲程式班",
      category: "線上訂閱",
      price: 799,
      description: "從零開始學 Scratch 遊戲開發，導入電腦視覺與語音辨識外掛，在家也能成為小工程師！",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
      tags: ["每月扣款", "專屬社群", "直播 Q&A"],
      duration: "每月 4 堂教學 + 每週線上答疑",
      details: "透過生動有趣的闖關模式，學習變數、迴圈、條件式等核心程式邏輯，結合攝影機辨識手勢玩自製遊戲！"
    }
  ]
};

let db = { ...defaultDb };

const loadDb = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(data);
    } else {
      saveDb();
    }
  } catch (err) {
    console.error("Error reading db.json:", err);
  }
};

const saveDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db.json:", err);
  }
};

loadDb();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // --- API Routes ---

  app.get("/api/download-zip", (req, res) => {
    try {
      const rootDir = process.cwd();
      const zip = new Zip();
      const excludeList = ['node_modules', '.git', 'dist', 'bun.lock'];

      function addFilesRecursively(currentPath: string, zipPath: string) {
        const items = fs.readdirSync(currentPath);
        for (const item of items) {
          const fullPath = path.join(currentPath, item);
          const relPath = path.relative(rootDir, fullPath);

          if (excludeList.some(ex => relPath === ex || relPath.startsWith(ex + '/'))) {
            continue;
          }

          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            addFilesRecursively(fullPath, path.join(zipPath, item));
          } else {
            const content = fs.readFileSync(fullPath);
            zip.addFile(path.join(zipPath, item).replace(/\\/g, '/'), content);
          }
        }
      }

      addFilesRecursively(rootDir, '');
      const zipBuffer = zip.toBuffer();

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="staredu-source.zip"');
      res.send(zipBuffer);
    } catch (err) {
      console.error("Zip error:", err);
      res.status(500).json({ error: "Failed to generate zip file" });
    }
  });

  app.get("/api/config", (req, res) => {
    res.json(db.config);
  });

  app.post("/api/config", (req, res) => {
    const { homeBanners, physicalBanner, onlineBanner } = req.body;
    if (homeBanners) db.config.homeBanners = homeBanners;
    if (physicalBanner) db.config.physicalBanner = physicalBanner;
    if (onlineBanner) db.config.onlineBanner = onlineBanner;
    saveDb();
    res.json({ success: true, config: db.config });
  });

  app.get("/api/courses", (req, res) => {
    const { type } = req.query;
    if (type) {
      const filtered = db.courses.filter(c => c.type === type);
      return res.json(filtered);
    }
    res.json(db.courses);
  });

  app.get("/api/courses/:id", (req, res) => {
    const course = db.courses.find(c => c.id === req.params.id);
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ error: "Course not found" });
    }
  });

  app.post("/api/courses", (req, res) => {
    const { title, type, category, price, description, image, tags, location, duration, details, startDate, endDate } = req.body;
    const newCourse = {
      id: `${type === 'physical' ? 'phy' : 'on'}-${Date.now()}`,
      title,
      type,
      category,
      price: Number(price),
      description,
      image,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map((t: string) => t.trim()) : []),
      location: location || '',
      duration: duration || '',
      details: details || '',
      startDate: startDate || '',
      endDate: endDate || ''
    };
    db.courses.push(newCourse);
    saveDb();
    res.json({ success: true, course: newCourse });
  });

  app.put("/api/courses/:id", (req, res) => {
    const { title, category, price, description, image, tags, location, duration, details, startDate, endDate } = req.body;
    const course = db.courses.find(c => c.id === req.params.id);
    if (course) {
      if (title !== undefined) course.title = title;
      if (category !== undefined) course.category = category;
      if (price !== undefined) course.price = Number(price);
      if (description !== undefined) course.description = description;
      if (image !== undefined) course.image = image;
      if (tags !== undefined) course.tags = Array.isArray(tags) ? tags : tags.split(",").map((t: string) => t.trim());
      if (location !== undefined) course.location = location;
      if (duration !== undefined) course.duration = duration;
      if (details !== undefined) course.details = details;
      if (startDate !== undefined) course.startDate = startDate;
      if (endDate !== undefined) course.endDate = endDate;
      saveDb();
      res.json({ success: true, course });
    } else {
      res.status(404).json({ error: "Course not found" });
    }
  });

  app.delete("/api/courses/:id", (req, res) => {
    const index = db.courses.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      const removed = db.courses.splice(index, 1);
      saveDb();
      res.json({ success: true, course: removed[0] });
    } else {
      res.status(404).json({ error: "Course not found" });
    }
  });

  // Stripe Checkout Session Creation
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { courseId } = req.body;
      const course = db.courses.find((c) => c.id === courseId);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const stripe = getStripe();
      const origin = req.headers.origin || "http://localhost:3000";

      // If Stripe key is not configured, simulate a successful redirect for preview
      if (!stripe) {
        return res.json({
          url: `${origin}/success?session_id=demo_session_${course.id}&course_id=${course.id}`,
        });
      }

      const isSubscription = course.type === "online";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "twd",
              product_data: {
                name: course.title,
                description: course.description,
                images: course.image.startsWith("http") ? [course.image] : [],
              },
              unit_amount: course.price * 100, // TWD in smallest currency unit
              ...(isSubscription && {
                recurring: {
                  interval: "month",
                },
              }),
            },
            quantity: 1,
          },
        ],
        mode: isSubscription ? "subscription" : "payment",
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&course_id=${course.id}`,
        cancel_url: `${origin}/${course.type === "physical" ? "physical-courses" : "online-courses"}`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Checkout Error:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  // Stripe Session verification endpoint
  app.get("/api/checkout-session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const stripe = getStripe();

      if (!stripe || sessionId.startsWith("demo_session_")) {
        return res.json({
          id: sessionId,
          payment_status: "paid",
          status: "complete",
          demo: true,
        });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      res.json(session);
    } catch (error: any) {
      console.error("Retrieve Session Error:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve session" });
    }
  });

  // --- Vite Dev Middleware or Static Serving ---
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
