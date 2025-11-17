import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import axios from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUser = useCallback(async () => {

    setLoading(true)
    setError(null)
    try{
        
      const res = await axios.get('users/me/')
      setUser(res.data)

    }catch(err) {

      setUser(null)
      setError(err.response?.data || err.message || 'Failed to fetch user')
      
    }finally {
      setLoading(false)
    }
  }, [])

  const login = async (token) => {
    if (!token) return false
    try{
      localStorage.setItem('token', token)
      // axios instance reads token from localStorage via interceptor
      await fetchUser()
      return true
    }catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data || err.message || 'Login failed')
      localStorage.removeItem('token')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [fetchUser])

  const value = {
    user,
    loading,
    error,
    fetchUser,
    login,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export default AuthProvider
