const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

// 🧪 Test route
router.get("/ping", (req, res) => {
  console.log("✅ /api/auth/ping was hit");
  res.json({ msg: "Auth route is working!" });
});

router.post("/signup", register);
router.post("/signin", login);

module.exports = router;
