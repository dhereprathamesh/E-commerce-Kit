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
    throw err; // <-- Re-throw so the calling function drops to its .catch() block!
  }
};

module.exports = { sendEmail };
