const bcrypt = require("bcryptjs");

const prisma = require("../../config/db");
const emailService = require('../notifications/email.service')
const authConfig = require("../../config/auth.config")

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/token");

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString() // Standardized to 8-digit code
}

const getExpiry = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000)
}

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
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
        type: 'EMAIL_VERIFICATION',
        expiresAt: getExpiry(authConfig.verification.expiryMinutes || 60)
      }
    })

    // Ensure this matches your email layout method name
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
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
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

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
