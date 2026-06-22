module.exports = {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },
  lockout: {
    maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    durationMinutes: parseInt(process.env.LOCK_DURATION_MINUTES) || 30
  },
  verification: {
    expiryMinutes: parseInt(process.env.VERIFICATION_CODE_EXPIRY_MINUTES) || 15
  }
}