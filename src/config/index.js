import 'dotenv/config'

// Fail fast — if any required env var is missing, crash immediately on
// startup rather than getting a confusing error later deep in the code
const required = [
  'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
  'JWT_SECRET', 'JWT_REFRESH_SECRET', 'ENCRYPTION_KEY',
  'DEFAULT_AVATAR_URL', 'DEFAULT_AVATAR_PUBLIC_ID'
]

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY,
  },
}

export default config
