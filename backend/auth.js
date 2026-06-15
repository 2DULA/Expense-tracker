const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('./db')
const router = express.Router()

// Sign up
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body
        const hashed = await bcrypt.hash(password, 10)
        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, hashed]
        )
        const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET)
        res.json({ token })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Log in
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' })
        const valid = await bcrypt.compare(password, result.rows[0].password)
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
        const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET)
        res.json({ token })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router