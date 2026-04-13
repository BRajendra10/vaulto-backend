// Run with: node src/db/migrations/run.js

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'

// ESM doesn't have __dirname — this is the standard way to get it
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const run = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  })

  console.log('✅ Connected to database')

  // Read all .sql files in this folder and sort them — runs 001, 002, 003... in order
  const files = fs
    .readdirSync(__dirname)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const sql = fs.readFileSync(path.join(__dirname, file), 'utf8')
    try {
      await connection.query(sql)
      console.log(`✅ Ran: ${file}`)
    } catch (err) {
      console.error(`❌ Failed: ${file} —`, err.message)
      await connection.end()
      process.exit(1)
    }
  }

  console.log('🎉 All migrations ran successfully')
  await connection.end()
}

run()
