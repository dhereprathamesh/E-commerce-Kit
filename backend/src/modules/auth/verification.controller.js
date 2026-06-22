// src/controllers/verification.controller.js
const verificationService = require('./verification.service');

const verifyEmail = async (req, res, next) => {
  try {
    // Look up by explicit email + 8-digit code combinations
    const { email, code } = req.body;
    const result = await verificationService.verifyEmail(email, code);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await verificationService.resendVerification(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { verifyEmail, resendVerification };