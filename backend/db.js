const { Pool } = require('pg')
require('dotenv').config()
console.log('DB_HOST:', process.env.DB_HOST)


const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
})

pool.connect((err) => {
    if (err) {
      console.error('Database connection error:', err.message)
    } else {
      console.log('Database connected successfully!')
    }
  })
  
module.exports = pool