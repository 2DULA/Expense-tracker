const express = require('express')
const cors = require('cors')
require('dotenv').config()
const pool = require('./db')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000

// Get all expenses
app.get('/expenses', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM expenses ORDER BY date DESC')
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Add an expense
app.post('/expenses', async (req, res) => {
    try {
        const { name, amount, category, date } = req.body
        const result = await pool.query(
            'INSERT INTO expenses (name, amount, category, date) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, amount, category, date]
        )
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Delete an expense
app.delete('/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params
        await pool.query('DELETE FROM expenses WHERE id = $1', [id])
        res.json({ message: 'Expense deleted' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Update an expense
app.put('/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { name, amount, category, date } = req.body
        const result = await pool.query(
            'UPDATE expenses SET name=$1, amount=$2, category=$3, date=$4 WHERE id=$5 RETURNING *',
            [name, amount, category, date, id]
        )
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})