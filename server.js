require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

// Deploy hone par cloud hosting apna PORT khud degi, local par 5000 chalega
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Pehle MongoDB Atlas se connection banayenge
  await connectDB();

  // 2. Uske baad Express Server ko port par listen karwayenge
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

startServer();