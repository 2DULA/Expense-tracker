const express = require('express')
const cors = require('cors')
require('dotenv').config()
const pool = require('./db')
const authRoutes = require('./auth')
const authenticate = require('./middleware')

const app = express()

app.use(cors({
    origin: /\.vercel\.app$/,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use('/auth', authRoutes)

const PORT = process.env.PORT || 5000

// Get all expenses for logged in user
app.get('/expenses', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
            [req.userId]
        )
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Add an expense
app.post('/expenses', authenticate, async (req, res) => {
    try {
        const { name, amount, category, date } = req.body
        const result = await pool.query(
            'INSERT INTO expenses (name, amount, category, date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, amount, category, date, req.userId]
        )
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Update an expense
app.put('/expenses/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params
        const { name, amount, category, date } = req.body
        const result = await pool.query(
            'UPDATE expenses SET name=$1, amount=$2, category=$3, date=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
            [name, amount, category, date, id, req.userId]
        )
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Delete an expense
app.delete('/expenses/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params
        await pool.query(
            'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        )
        res.json({ message: 'Expense deleted' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})