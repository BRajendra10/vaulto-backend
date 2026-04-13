// auth.queries.js — raw SQL strings only, no logic here

const findUserByEmail = `
  SELECT id, email, password, is_email_verified, auth_provider
  FROM users
  WHERE email = ?
  LIMIT 1
`

const createUser = `
  INSERT INTO users (email, password, is_email_verified, auth_provider, created_at, updated_at)
  VALUES (?, ?, false, 'local', NOW(), NOW())
`

const createSession = `
  INSERT INTO session (user_id, refresh_token, expiry_at, ip_address, user_agent, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, NOW(), NOW())
`

const findSessionByRefreshToken = `
  SELECT s.*, u.id AS user_id, u.email
  FROM session s
  JOIN users u ON u.id = s.user_id
  WHERE s.refresh_token = ?
  AND s.expiry_at > NOW()
  LIMIT 1
`

const deleteSession = `
  DELETE FROM session WHERE refresh_token = ?
`

const deleteAllUserSessions = `
  DELETE FROM session WHERE user_id = ?
`

export {
  findUserByEmail,
  createUser,
  createSession,
  findSessionByRefreshToken,
  deleteSession,
  deleteAllUserSessions,
}
