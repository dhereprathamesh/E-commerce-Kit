const bcrypt = require("bcryptjs");
const prisma = require("../../config/db");
const emailService = require("../notifications/email.service");
const authConfig = require("../../config/auth.config")

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString() // Standardized to 8-digit code
}

const getExpiry = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000)
}

const registerUser = async (name, email, password) => {
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    const error = new Error('Email already registered')
    error.status = 409
    throw error
  }

  const passwordHash = await bcrypt.hash(password, authConfig.bcrypt.rounds || 12)

  // Register standalone user account
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    }
  })

  const code = generateCode()
  await prisma.verificationCode.create({
    data: {
      userId: user.id,
      code,
      type: 'EMAIL_VERIFICATION',
      expiresAt: getExpiry(authConfig.verification.expiryMinutes || 60)
    }
  })

  // Ensure this matches your email layout method name
  await emailService.sendVerificationEmail(email, code)

  return { userId: user.id, message: 'Verification email sent' }
};

module.exports = {
  registerUser,
};
