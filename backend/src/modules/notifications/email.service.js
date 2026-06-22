const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})


const sendOrganizationInvite = async (toEmail, inviterName, orgName, inviteToken) => {
  // In production, this URL points to your React frontend route
  const inviteLink = `${process.env.FRONTEND_URL}/invites/accept?token=${inviteToken}`;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: toEmail,
      subject: `You have been invited to join ${orgName}`,
      html: `
        <h2>Hello!</h2>
        <p><strong>${inviterName}</strong> has invited you to join their team on <strong>${orgName}</strong>.</p>
        <p><a href="${inviteLink}" style="padding: 10px 15px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">Accept Invitation</a></p>
        <p>Or copy this link: ${inviteLink}</p>
        <p>This link expires in 48 hours.</p>
      `,
    });
  } catch (err) {
    console.log("Email error:", err.message);
    throw err; // <-- Re-throw so the calling function drops to its .catch() block!
  }
};

/**
 * Sends email verification code
 */
const sendVerificationEmail = async (email, code) => {
  await transporter.sendMail({
    from: `"Auth Service" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Use the code below to verify your email address.</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; 
                    font-size: 32px; font-weight: bold; letter-spacing: 8px;">
          ${code}
        </div>
        <p>This code expires in 15 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      </div>
    `
  })
}

/**
 * Sends password reset code
 */
const sendPasswordResetEmail = async (email, code) => {
  await transporter.sendMail({
    from: `"Auth Service" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Password reset code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Use the code below to reset your password.</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center;
                    font-size: 32px; font-weight: bold; letter-spacing: 8px;">
          ${code}
        </div>
        <p>This code expires in 15 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      </div>
    `
  })
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrganizationInvite
}