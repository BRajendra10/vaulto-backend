// auth.queries.js — raw SQL strings only, no logic here

const findUserByEmail = `
  SELECT id, email, password, is_email_verified, auth_provider
  FROM users
  WHERE email = ?
  LIMIT 1
`

const createUser = `
  INSERT INTO users (email, password, is_email_verified, auth_provider, avatar, avatar_public_id, created_at, updated_at)
  VALUES (?, ?, false, 'local', ?, ?, NOW(), NOW())
`

const createSession = `
  INSERT INTO session (user_id, refresh_token_hash, expiry_at, ip_address, user_agent, created_at, updated_at, last_used_at)
  VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())
`

const findSessionByRefreshToken = `
  SELECT s.*, u.id AS user_id, u.email
  FROM session s
  JOIN users u ON u.id = s.user_id
  WHERE s.refresh_token_hash = ?
  LIMIT 1
`

const revokeSession = `
  UPDATE session 
  SET is_revoked = 1, updated_at = NOW() 
  WHERE refresh_token_hash = ?
`

const deleteSession = `
  DELETE FROM session WHERE refresh_token = ?
`

const deleteAllUserSessions = `
  DELETE FROM session WHERE user_id = ?
`

const verifyUserEmail = `
  UPDATE users SET is_email_verified = true, updated_at = NOW() WHERE id = ?
`

export {
  findUserByEmail,
  createUser,
  createSession,
  findSessionByRefreshToken,
  revokeSession,
  deleteSession,
  deleteAllUserSessions,
  verifyUserEmail,
}
