const pool = require('./db')

const setup = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      amount DECIMAL NOT NULL,
      category VARCHAR(50),
      date DATE DEFAULT CURRENT_DATE
    )
  `)
  console.log('Database table created!')
  process.exit()
}

setup()