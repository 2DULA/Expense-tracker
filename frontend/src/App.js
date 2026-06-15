import { useState, useEffect } from 'react'

const API_URL = 'https://expense-tracker-3g0m.onrender.com'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [expenses, setExpenses] = useState([])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setExpenses(Array.isArray(data) ? data : []))
    }
  }, [token])

  const handleAuth = async () => {
    setError('')
    const endpoint = isLogin ? '/auth/login' : '/auth/signup'
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await response.json()
    if (data.token) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
    } else {
      setError(data.error)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setExpenses([])
  }

  const addExpense = async () => {
    if (!name || !amount || !category || !date) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, amount, category, date })
    })
    const newExpense = await response.json()
    setExpenses([...expenses, newExpense])
    setName(''); setAmount(''); setCategory(''); setDate('')
  }

  const deleteExpense = async (id, expenseName) => {
    if (!window.confirm(`Are you sure you want to delete "${expenseName}"?`)) return
    await fetch(`${API_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const startEdit = (expense) => {
    setEditingId(expense.id)
    setEditData({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date?.split('T')[0]
    })
  }

  const saveEdit = async (id) => {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(editData)
    })
    const updated = await response.json()
    setExpenses(expenses.map(e => e.id === id ? updated : e))
    setEditingId(null)
  }

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  const styles = {
    container: { maxWidth: '650px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' },
    header: { marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    total: { fontSize: '1.2rem', color: '#555', marginBottom: '1.5rem' },
    form: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' },
    input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem' },
    error: { color: 'red', fontSize: '0.85rem', marginBottom: '1rem' },
    btn: { padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.9rem' },
    addBtn: { background: '#0070f3', color: 'white' },
    editBtn: { background: '#f0f0f0', marginLeft: '0.5rem' },
    saveBtn: { background: '#22c55e', color: 'white', marginLeft: '0.5rem' },
    cancelBtn: { background: '#f0f0f0', marginLeft: '0.5rem' },
    deleteBtn: { background: '#ef4444', color: 'white', marginLeft: '0.5rem' },
    logoutBtn: { background: '#ef4444', color: 'white' },
    card: { border: '1px solid #ddd', padding: '0.75rem 1rem', marginBottom: '0.5rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    emptyState: { color: '#999', textAlign: 'center', marginTop: '2rem' },
    authContainer: { maxWidth: '400px', margin: '5rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' },
    authInput: { width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem', boxSizing: 'border-box' },
  }

  if (!token) {
    return (
      <div style={styles.authContainer}>
        <h2>{isLogin ? 'Log In' : 'Sign Up'}</h2>
        <br />
        <input style={styles.authInput} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={styles.authInput} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p style={styles.error}>{error}</p>}
        <button style={{ ...styles.btn, ...styles.addBtn, width: '100%' }} onClick={handleAuth}>
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', textAlign: 'center' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: '#0070f3', cursor: 'pointer' }} onClick={() => { setIsLogin(!isLogin); setError('') }}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Expense Tracker</h1>
        <button style={{ ...styles.btn, ...styles.logoutBtn }} onClick={logout}>Logout</button>
      </div>
      <p style={styles.total}>Total: <strong>${total.toFixed(2)}</strong></p>

      <div style={styles.form}>
        <input style={styles.input} placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input style={styles.input} placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
        <input style={styles.input} placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
        <input style={styles.input} type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button style={{ ...styles.btn, ...styles.addBtn }} onClick={addExpense}>Add</button>
      </div>
      {error && <p style={styles.error}>{error}</p>}

      {expenses.length === 0 ? (
        <p style={styles.emptyState}>No expenses yet. Add one above!</p>
      ) : (
        expenses.map(e => (
          <div key={e.id} style={styles.card}>
            {editingId === e.id ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
                <input style={styles.input} value={editData.name} onChange={ev => setEditData({ ...editData, name: ev.target.value })} />
                <input style={styles.input} value={editData.amount} onChange={ev => setEditData({ ...editData, amount: ev.target.value })} />
                <input style={styles.input} value={editData.category} onChange={ev => setEditData({ ...editData, category: ev.target.value })} />
                <input style={styles.input} type="date" value={editData.date} onChange={ev => setEditData({ ...editData, date: ev.target.value })} />
                <button style={{ ...styles.btn, ...styles.saveBtn }} onClick={() => saveEdit(e.id)}>Save</button>
                <button style={{ ...styles.btn, ...styles.cancelBtn }} onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <span><strong>{e.name}</strong> — ${e.amount} — {e.category} — {new Date(e.date).toLocaleDateString('en-US')}</span>
                <div>
                  <button style={{ ...styles.btn, ...styles.editBtn }} onClick={() => startEdit(e)}>Edit</button>
                  <button style={{ ...styles.btn, ...styles.deleteBtn }} onClick={() => deleteExpense(e.id, e.name)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default App