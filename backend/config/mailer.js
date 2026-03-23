import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  if (!to) {
    throw new Error("Email recipient (to) is missing");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
    rejectUnauthorized: false, 
  },
  });

  await transporter.sendMail({
    from: `"Please use this OTP for verification " <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });

  console.log("📧 Email sent successfully to:", to);
};

export default sendEmail;