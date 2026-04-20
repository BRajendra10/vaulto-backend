import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  // host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  // port: process.env.EMAIL_PORT || 587,
  // secure: false,
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Vaulto Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email Verification OTP',
    text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
    html: `<p>Your verification code is: <b>${otp}</b>.</p><p>It expires in 10 minutes.</p>`,
  }
  await transporter.sendMail(mailOptions)
}