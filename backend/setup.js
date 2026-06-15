const pool = require('./db')

const setup = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `)

  await pool.query(`
    ALTER TABLE expenses 
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
  `)

  console.log('Database tables updated!')
  process.exit()
}

setup()