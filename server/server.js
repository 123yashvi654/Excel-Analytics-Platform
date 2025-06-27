const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 🧪 Log every request
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoute");

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port", process.env.PORT || 5000);
    });
  })
  .catch((err) => console.error("DB connection error:", err));
