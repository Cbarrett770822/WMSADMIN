import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material'
import axios from 'axios'

const apps = [
  { key: 'wmsQuestionnaire', label: 'WMS Questionnaire' },
  { key: 'roiAssessment', label: 'ROI Assessment' },
  { key: 'dashboardGenerator', label: 'Dashboard Generator' },
  { key: 'demoAssist', label: 'Demo Assist' }
]

function Permissions() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get('/.netlify/functions/users-list', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data)
    } catch (error) {
      showSnackbar('Failed to fetch users', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = async (userId, appKey, field, value) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('adminToken')
      
      const user = users.find(u => u._id === userId)
      const updatedPermissions = {
        ...user.appPermissions,
        [appKey]: {
          ...user.appPermissions[appKey],
          [field]: value
        }
      }

      await axios.put(
        '/.netlify/functions/permissions-update',
        { userId, appPermissions: updatedPermissions },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setUsers(users.map(u => 
        u._id === userId 
          ? { ...u, appPermissions: updatedPermissions }
          : u
      ))

      showSnackbar('Permissions updated successfully', 'success')
    } catch (error) {
      showSnackbar('Failed to update permissions', 'error')
    } finally {
      setSaving(false)
    }
  }

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        App Permissions
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage user access to different applications
      </Typography>

      {apps.map((app) => (
        <Paper key={app.key} sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {app.label}
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Access</TableCell>
                  <TableCell align="center">Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={user.appPermissions?.[app.key]?.enabled || false}
                        onChange={(e) => handlePermissionChange(
                          user._id,
                          app.key,
                          'enabled',
                          e.target.checked
                        )}
                        disabled={saving || user.role === 'super_admin'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={user.appPermissions?.[app.key]?.role || 'user'}
                          onChange={(e) => handlePermissionChange(
                            user._id,
                            app.key,
                            'role',
                            e.target.value
                          )}
                          disabled={
                            saving || 
                            user.role === 'super_admin' || 
                            !user.appPermissions?.[app.key]?.enabled
                          }
                        >
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="user">User</MenuItem>
                          <MenuItem value="viewer">Viewer</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Permissions
