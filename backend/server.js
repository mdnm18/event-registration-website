import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import os from "os";
import { fileURLToPath } from "url"; // ✅ Fix for __dirname in ESM

// ✅ Recreate __dirname and __filename in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "registrations.json");
const BACKUP_FILE = path.join(__dirname, `backup-${Date.now()}.json`);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

// 🔐 Token Utilities
const generateAccessToken = () =>
  jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "15m" });

const generateRefreshToken = () =>
  jwt.sign({ role: "admin" }, REFRESH_SECRET, { expiresIn: "7d" });

let refreshTokens = []; // In-memory store (use DB in production)

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Rate Limiting
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many registrations from this IP. Please try again later.",
  },
});

// Ensure registrations.json exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

// Backup file on startup
fs.copyFileSync(DATA_FILE, BACKUP_FILE);

// 🔐 JWT Middleware (reads from cookie)
const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// 🔐 Admin Login Route
app.post("/admin-login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const accessToken = generateAccessToken();
    const refreshToken = generateRefreshToken();
    refreshTokens.push(refreshToken);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // set true in production with HTTPS
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: "Login successful" });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// 🔁 Refresh Token Route
app.post("/auth/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }

  try {
    jwt.verify(refreshToken, REFRESH_SECRET);
    const newAccessToken = generateAccessToken();

    res
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000,
      })
      .json({ message: "Token refreshed" });
  } catch {
    res.status(403).json({ error: "Expired or invalid refresh token" });
  }
});

// 🔓 Logout Endpoint
app.post("/logout", (req, res) => {
  res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    })
    .json({ message: "Logged out successfully" });
});

// ✅ GET /registrations (protected)
app.get("/registrations", verifyToken, (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    const registrations = JSON.parse(data);
    res.json(registrations);
  } catch {
    res.status(500).json({ error: "Failed to read registrations" });
  }
});

// ✅ POST /register (public)
app.post(
  "/register",
  registerLimiter,
  [
    body("name").trim().escape().notEmpty().withMessage("Name is required"),
    body("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Valid email is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "unknown";

    try {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      const registrations = JSON.parse(data);

      const alreadyRegistered = registrations.some(
        (entry) => entry.email.toLowerCase() === email.toLowerCase()
      );
      if (alreadyRegistered) {
        return res.status(400).json({
          errors: [{ msg: "This email is already registered." }],
        });
      }

      const newEntry = {
        name,
        email,
        date: new Date().toISOString(),
        ip,
        userAgent,
      };

      registrations.push(newEntry);
      fs.writeFileSync(DATA_FILE, JSON.stringify(registrations, null, 2));

      res.status(201).json({
        message: "Registration successful",
        entry: newEntry,
      });
    } catch {
      res.status(500).json({ error: "Failed to save registration" });
    }
  }
);

// ✅ DELETE /registrations/:email (protected)
app.delete("/registrations/:email", verifyToken, (req, res) => {
  const emailToDelete = req.params.email.toLowerCase();

  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    let registrations = JSON.parse(data);

    registrations = registrations.filter(
      (r) => r.email.toLowerCase() !== emailToDelete
    );

    fs.writeFileSync(DATA_FILE, JSON.stringify(registrations, null, 2));
    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
