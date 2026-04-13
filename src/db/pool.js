import mysql from 'mysql2/promise'
import config from '../config/index.js'

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,  // max simultaneous connections
  queueLimit: 0,        // unlimited queue
  timezone: 'Z',        // store all dates as UTC
})

// Test connection on startup — crash early if DB is unreachable
// so we don't accept traffic with a broken DB connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ MySQL connected successfully')
    connection.release()
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message)
    process.exit(1)
  }
}

export { pool, testConnection }
