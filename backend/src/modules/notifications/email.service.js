const transporter = require("../../config/email");

// Generic send email function
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.log("Email error:", err.message);
  }
};

module.exports = { sendEmail };
