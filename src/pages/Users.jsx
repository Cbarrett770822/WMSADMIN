import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Alert,
  Snackbar
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import axios from 'axios'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'user',
    isActive: true
  })

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

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        password: '',
        role: user.role,
        isActive: user.isActive
      })
    } else {
      setEditingUser(null)
      setFormData({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        role: 'user',
        isActive: true
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingUser(null)
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      if (editingUser) {
        await axios.put(
          `/.netlify/functions/users-update`,
          { userId: editingUser._id, ...formData },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        showSnackbar('User updated successfully', 'success')
      } else {
        await axios.post(
          '/.netlify/functions/users-create',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        showSnackbar('User created successfully', 'success')
      }
      
      handleCloseDialog()
      fetchUsers()
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Operation failed', 'error')
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(`/.netlify/functions/users-delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId }
      })
      showSnackbar('User deleted successfully', 'success')
      fetchUsers()
    } catch (error) {
      showSnackbar('Failed to delete user', 'error')
    }
  }

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity })
  }

  const columns = [
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'firstName', headerName: 'First Name', width: 130 },
    { field: 'lastName', headerName: 'Last Name', width: 130 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value === 'super_admin' ? 'error' : params.value === 'admin' ? 'warning' : 'default'}
        />
      )
    },
    { 
      field: 'isActive', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Active' : 'Inactive'} 
          size="small" 
          color={params.value ? 'success' : 'default'}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row._id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage user accounts and access
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          getRowId={(row) => row._id}
          disableSelectionOnClick
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="super_admin">Super Admin</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default Users
