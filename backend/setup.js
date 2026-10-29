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
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      amount NUMERIC NOT NULL,
      category VARCHAR(255),
      date DATE DEFAULT CURRENT_DATE,
      user_id INTEGER REFERENCES users(id)
    )
  `)

  // Older databases created the expenses table before user accounts existed
  await pool.query(`
    ALTER TABLE expenses
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
  `)

  console.log('Database tables updated!')
  process.exit()
}

setup().catch((err) => {
  console.error('Setup failed:', err.message)
  process.exit(1)
})