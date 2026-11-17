const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const bookingRoutes = require("./routes/bookingRoutes");



// Routes import
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");

const app = express();

// Middlewares
app.use(cors());

// Parse JSON body only for methods with payload (skip GET / HEAD so empty body doesn't trigger SyntaxError)
app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD") {
    return next();
  }
  express.json()(req, res, next);
});

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
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
