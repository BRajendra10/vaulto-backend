const findById = `
  SELECT id, username, email, is_email_verified, avatar, auth_provider, created_at, updated_at
  FROM users
  WHERE id = ?
  LIMIT 1
`

const findByUsernameExcludingId = `
  SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1
`

const updateProfile = `
  UPDATE users
  SET avatar = ?, updated_at = NOW()
  WHERE id = ?
`

const updateUsername = `
  UPDATE users
  SET username = ?, updated_at = NOW()
  WHERE id = ?
`

const updatePassword = `
  UPDATE users
  SET password = ?, updated_at = NOW()
  WHERE id = ?
`

const findPasswordById = `
  SELECT password FROM users WHERE id = ? LIMIT 1
`

export { findById, findByUsernameExcludingId, updateProfile, updateUsername, updatePassword, findPasswordById }
