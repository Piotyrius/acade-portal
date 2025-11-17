import React, { useState } from 'react'
import axios from '../../api/axios'
import { useAuth } from '../../context/AuthProvider'
import './Login.css'

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const { login } = useAuth()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)
        setLoading(true)
        try {
            const res = await axios.post('auth/login/', form)
            if (res.status === 200 && res.data.access) {
                const ok = await login(res.data.access)
                if (ok) {
                    setSuccess(true)
                } else {
                    setError('Failed to load user after login')
                }
            } else {
                setError('Unexpected server response')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError(err.response?.data?.detail || err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit} noValidate>
                <h2>Login</h2>
                {error && <div className="error">{error}</div>}
                {success && <div className="success">Logged in successfully</div>}

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    )
}

export default Login