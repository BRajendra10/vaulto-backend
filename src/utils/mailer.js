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
  logger: true,
  debug: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
})

export const sendOTPEmail = async (email, otp) => {
  console.log('EMAIL START', email)

  const mailOptions = {
    from: `"Vaulto Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email Verification OTP',
    text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
    html: `<p>Your verification code is: <b>${otp}</b>.</p><p>It expires in 10 minutes.</p>`,
  }

  const info = await transporter.sendMail(mailOptions)

  console.log('EMAIL SUCCESS', info.messageId)

  return info
}