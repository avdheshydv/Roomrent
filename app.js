const express = require("express");
const cors = require("cors");

// Routes import
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Room Rent API Server is live and running!",
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);

module.exports = app;