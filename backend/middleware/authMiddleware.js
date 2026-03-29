import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      // 👇 YAHAN ADD KARO (catch block ke andar)
      console.log("=== TOKEN DEBUG ===");
      console.log("Token jo aaya:", token);
      console.log("Secret:", process.env.JWT_SECRET);
      console.log("Error:", error.message);
      console.log("===================");
      return res
        .status(401)
        .json({ message: "Token invalid hai, access nahi milega" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Token nahi hai, access nahi milega" });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' ko ye karne ki permission nahi hai`,
      });
    }
    next();
  };
};

export { protect, authorizeRoles };
