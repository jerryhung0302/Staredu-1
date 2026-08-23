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
      {
        image: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&q=80&w=1600",
        linkUrl: "/physical-courses"
      },
      {
        image: "https://www.anuefund.com/Upload/Files/IndexBanner/Ad/1903x530_pc_20250730093235973021.jpg",
        linkUrl: "/online-courses"
      },
      {
        image: "https://drive.google.com/file/d/1gEneP9TbpPKy79uIbRj-45UhDvSDVOM7/view?usp=drive_link",
        linkUrl: "/physical-courses"
      }
    ],
    physicalBanner: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1600",
    onlineBanner: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=1600",
  },
  courses: [
    {
      id: "phy-1",
      type: "physical",
      title: "【寒假營隊】小小巴菲特兒童理財創客營",
      category: "冬令營 / 實體活動",
      price: 8800,
      description: "透過情境模擬桌遊、實體貨幣交易與零用錢規劃，引導孩子建立正確金錢觀念與儲蓄思維。",
      image: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&q=80&w=800",
      tags: ["理財啟蒙", "情境桌遊", "小學 1-6 年級"],
      location: "台北市大安區教育中心",
      duration: "5 天全日營",
      startDate: "2025-01-20",
      endDate: "2025-01-24",
      details: "專為國教學童設計的生活化理財營隊，藉由「虛擬小小社會體驗」、「日常記帳手作帳本」及「理性消費大挑戰」，讓孩子在趣味互動中學會珍惜資源、分辨「需要」與「想要」，培養受用一生的財務素養。"
    },
    {
      id: "phy-2",
      type: "physical",
      title: "【週末實體】小小創業家商業探索與拍賣工作坊",
      category: "週末常態班",
      price: 4200,
      description: "讓孩子學習商品定價、成本概念與行銷拍賣，動手設計攤位，體驗真實商業運作樂趣。",
      image: "https://images.unsplash.com/photo-1556742049-0a67e5572293?auto=format&fit=crop&q=80&w=800",
      tags: ["商業思維", "拍賣實戰", "創意美學"],
      location: "新北市板橋教室",
      duration: "4 週（每週六上午）",
      startDate: "2025-03-01",
      endDate: "2025-03-22",
      details: "融合數學應用與商業啟蒙，教導小朋友認識成本與利潤、規劃商品行銷策略，並親自主持創意拍賣會，提升口語表達與團隊協作能力。"
    },
    {
      id: "on-1",
      type: "online",
      title: "【線上月訂閱】生活中的金錢魔法：兒童理財素養課",
      category: "線上訂閱",
      price: 599,
      description: "每週解鎖全新趣味理財動畫與生活任務，陪伴孩子養成自律儲蓄與智慧消費好習慣！",
      image: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&q=80&w=800",
      tags: ["每月扣款", "隨時觀看", "課後任務"],
      duration: "每月 4 堂影音 + 生活實踐任務",
      details: "不限時間地點，專為學童打造的啟蒙理財動畫課。內容涵蓋貨幣歷史、零用錢管理三罐法、家庭預算小幫手等主題，每週搭配趣味互動任務，由助教線上鼓勵與指導。"
    },
    {
      id: "on-2",
      type: "online",
      title: "【線上月訂閱】小小管家智慧記帳與未來財商思維班",
      category: "線上訂閱",
      price: 799,
      description: "從日常記帳工具操作到數位支付觀念，結合線上互動社群，培育未來數位金融競爭力！",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
      tags: ["每月扣款", "專屬社群", "直播 Q&A"],
      duration: "每月 4 堂教學 + 每週線上答疑",
      details: "結合專屬小管家數位記帳系統與生活案例剖析，建立資產與負債概念、防範詐騙知識及現代數位消費觀念，每月舉辦線上互動工作坊解答學童疑惑。"
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
