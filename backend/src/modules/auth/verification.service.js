const prisma = require('../../config/db')
const config = require('../../config/auth.config')
const emailService = require('../notifications/email.service')

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString() // Standardized 8-digit code
}

const getExpiry = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000)
}

/**
 * VERIFY EMAIL
 */
const verifyEmail = async (email, code) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    const error = new Error('Invalid verification attempt')
    error.status = 400
    throw error
  }

  if (user.isEmailVerified) {
    return { status: "Success", message: 'Email already verified' }
  }

  const record = await prisma.verificationCode.findFirst({
    where: {
      userId: user.id,
      code,
      type: 'EMAIL_VERIFICATION',
      usedAt: null,
      expiresAt: { gt: new Date() }
    }
  })

  if (!record) {
    const error = new Error('Invalid or expired verification code')
    error.status = 400
    throw error
  }

  await prisma.$transaction([
    prisma.verificationCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() }
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, isActive: true }
    })
  ])

  return { status: "Success", message: 'Email verified successfully' }
}

/**
 * RESEND VERIFICATION
 */
const resendVerification = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || user.isEmailVerified) {
    return { status: "Success", message: 'If your email is registered and unverified, a code has been sent' }
  }

  await prisma.verificationCode.updateMany({
    where: {
      userId: user.id,
      type: 'EMAIL_VERIFICATION',
      usedAt: null
    },
    data: { usedAt: new Date() }
  })

  const code = generateCode()
  await prisma.verificationCode.create({
    data: {
      userId: user.id,
      code,
      type: 'EMAIL_VERIFICATION',
      expiresAt: getExpiry(config.verification.expiryMinutes || 60)
    }
  })

  await emailService.sendVerificationEmail(email, code);

  return { status: "Success", message: 'If your email is registered and unverified, a code has been sent' }
}

module.exports = { verifyEmail, resendVerification }