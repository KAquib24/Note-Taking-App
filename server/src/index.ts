import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import noteRoutes from "./routes/notes"; 
import path from "path";
import stylusRouter from "./routes/stylus";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - INCREASE PAYLOAD SIZE LIMIT
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: '50mb' })); // ✅ Increased from default ~100kb to 50mb
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // ✅ Increased limit

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes); 
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res) => {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
      res.set("Access-Control-Allow-Origin", "*");
    },
  })
);

app.use("/api/stylus", stylusRouter);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/database")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));