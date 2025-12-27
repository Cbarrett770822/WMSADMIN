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
  TablePagination,
  Chip,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import axios from 'axios'

function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [filter, setFilter] = useState({ action: 'all', appId: 'all' })

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get('/.netlify/functions/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLogs(response.data)
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getActionColor = (action) => {
    const colors = {
      login: 'success',
      logout: 'default',
      create_user: 'info',
      update_user: 'warning',
      delete_user: 'error',
      update_permissions: 'primary'
    }
    return colors[action] || 'default'
  }

  const filteredLogs = logs.filter(log => {
    if (filter.action !== 'all' && log.action !== filter.action) return false
    if (filter.appId !== 'all' && log.appId !== filter.appId) return false
    return true
  })

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
        Audit Log
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Track all user activities and system changes
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={filter.action}
              label="Action"
              onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            >
              <MenuItem value="all">All Actions</MenuItem>
              <MenuItem value="login">Login</MenuItem>
              <MenuItem value="logout">Logout</MenuItem>
              <MenuItem value="create_user">Create User</MenuItem>
              <MenuItem value="update_user">Update User</MenuItem>
              <MenuItem value="delete_user">Delete User</MenuItem>
              <MenuItem value="update_permissions">Update Permissions</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Application</InputLabel>
            <Select
              value={filter.appId}
              label="Application"
              onChange={(e) => setFilter({ ...filter, appId: e.target.value })}
            >
              <MenuItem value="all">All Apps</MenuItem>
              <MenuItem value="admin">Admin App</MenuItem>
              <MenuItem value="wms-questionnaire">WMS Questionnaire</MenuItem>
              <MenuItem value="roi-assessment">ROI Assessment</MenuItem>
              <MenuItem value="dashboard-generator">Dashboard Generator</MenuItem>
              <MenuItem value="demo-assist">Demo Assist</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Application</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.userEmail || 'Unknown'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={log.action.replace(/_/g, ' ')} 
                      size="small" 
                      color={getActionColor(log.action)}
                    />
                  </TableCell>
                  <TableCell>{log.appId || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {JSON.stringify(log.details).substring(0, 50)}...
                    </Typography>
                  </TableCell>
                  <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  )
}

export default AuditLog
