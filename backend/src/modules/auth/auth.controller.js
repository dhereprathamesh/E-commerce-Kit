const bcrypt = require("bcryptjs");
const prisma = require("../../config/db");
const emailService = require("../notifications/email.service");
const authConfig = require("../../config/auth.config");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/token");

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Standardized to 6-digit code
};

const getExpiry = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

// --- COOKIE CONFIGURATION HELPER ---
const cookieOptions = {
  httpOnly: true, // Safeguards against XSS attacks
  secure: process.env.NODE_ENV === "production", // HTTPS only in production environments
  sameSite: "strict", // Safeguards against CSRF attacks
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days match
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = generateCode();
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        type: "EMAIL_VERIFICATION",
        expiresAt: getExpiry(authConfig.verification.expiryMinutes || 60),
      },
    });

    await emailService.sendVerificationEmail(email, code);

    res.status(201).json({
      success: true,
      message: "User registered",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found!",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token reference to the Database
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // FIX 1: Attach Cookie FIRST before sending the JSON body
    res.cookie("refreshToken", refreshToken, cookieOptions);

    // FIX 2: Do not leak the refresh token inside the payload response
    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// --- NEW: REFRESH TOKEN ROUTE WITH ROTATION (RTR) ---
const refresh = async (req, res, next) => {
  try {
    // Read cookie directly from incoming request headers
    const clientRefreshToken = req.cookies?.refreshToken;

    if (!clientRefreshToken) {
      return res.status(401).json({ success: false, message: "Session expired or missing token" });
    }

    // Verify token against database logs while pulling relation user record
    const storedTokenLog = await prisma.refreshToken.findFirst({
      where: { token: clientRefreshToken },
      include: { user: true }, // Ensure relation name matches your schema.prisma definition
    });

    // Check if token exists or has run past its lifetime
    if (!storedTokenLog || storedTokenLog.expiresAt < new Date()) {
      if (storedTokenLog) {
        await prisma.refreshToken.delete({ where: { id: storedTokenLog.id } });
      }
      return res.status(401).json({ success: false, message: "Invalid or expired token session" });
    }

    const user = storedTokenLog.user;

    // Generate rotated token variants
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Delete the single-use token to avoid reuse attack patterns
    await prisma.refreshToken.delete({ where: { id: storedTokenLog.id } });

    // Store new replacement reference record
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update client storage engine with updated cookie wrapper
    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    return res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

// --- NEW: EXPLICIT LOGOUT ROUTE ---
const logout = async (req, res, next) => {
  try {
    const clientRefreshToken = req.cookies?.refreshToken;

    if (clientRefreshToken) {
      // Evacuate references from backend database layers
      await prisma.refreshToken.deleteMany({
        where: { token: clientRefreshToken },
      });
    }

    // Wipe cookie wrapper records clear from user's machine
    res.clearCookie("refreshToken", {
      ...cookieOptions,
      maxAge: 0, // Instant expiry invocation
    });

    return res.json({
      success: true,
      message: "Logged out clean.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};