import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Permissions from './pages/Permissions'
import AuditLog from './pages/AuditLog'
import Layout from './components/Layout'

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
})

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('adminToken'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken')
    const storedUser = localStorage.getItem('adminUser')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('adminToken', authToken)
    localStorage.setItem('adminUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
  }

  if (loading) {
    return null
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          
          <Route 
            path="/" 
            element={token ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="audit" element={<AuditLog />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
