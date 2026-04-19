export const createOTP = `
  INSERT INTO email_verification_otp (user_id, otp_hash, expires_at)
  VALUES (?, ?, ?)
`

export const findOTPByUserId = `
  SELECT * FROM email_verification_otp WHERE user_id = ? LIMIT 1
`

export const deleteOTPByUserId = `
  DELETE FROM email_verification_otp WHERE user_id = ?
`