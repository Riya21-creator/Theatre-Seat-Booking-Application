import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import seatRoutes from "./routes/seatRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// middlewares
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());

// routes
app.use("/api", seatRoutes);
app.use("/api/auth", authRoutes);

// test route
app.get("/", (req, res) => {
    res.send("Backend running ✅");
});

// DB + server
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected");
        app.listen(5000, () =>
            console.log("🚀 Backend running on port 5000")
        );
    })
    .catch((err) => console.error("❌ DB error", err));