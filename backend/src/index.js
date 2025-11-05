require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

// CORS - only allow your Vercel frontend
app.use(cors({
  origin: "https://your-vercel-frontend.vercel.app",
  credentials: true
}));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// Signup
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: "Email already exists" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ token });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Backend running on PORT", PORT));
