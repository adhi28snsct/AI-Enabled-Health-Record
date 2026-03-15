import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // true if using 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendInviteEmail = async ({ to, link, role }) => {
  const html = `
    <h2>You have been added as ${role}</h2>
    <p>Please login using your Google account:</p>
    <a href="${link}">${link}</a>
    <p>If you were not expecting this, please contact administrator.</p>
  `;

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: `Health Connect - ${role} Access`,
    html,
  });

  console.log("📨 Email sent:", info.messageId);
};