
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 👇 Fetch full user from DB
    const user = await User.findById(decoded.id).select("name email country");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; // 👈 Full user object now available
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth;
