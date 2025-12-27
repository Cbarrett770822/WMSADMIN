import { useState, useEffect } from 'react'
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material'
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon
} from '@mui/icons-material'
import axios from 'axios'

function StatCard({ title, value, icon, color }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              p: 2,
              borderRadius: 2
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get('/.netlify/functions/admin-stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
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
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Overview of user management system
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats?.activeUsers || 0}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inactive Users"
            value={stats?.inactiveUsers || 0}
            icon={<BlockIcon />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New This Month"
            value={stats?.newThisMonth || 0}
            icon={<PersonAddIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              App Access Distribution
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">WMS Questionnaire</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {stats?.appAccess?.wmsQuestionnaire || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">ROI Assessment</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {stats?.appAccess?.roiAssessment || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Dashboard Generator</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {stats?.appAccess?.dashboardGenerator || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Demo Assist</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {stats?.appAccess?.demoAssist || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Role Distribution
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Super Admin</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {stats?.roleDistribution?.super_admin || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Admin</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {stats?.roleDistribution?.admin || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">User</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {stats?.roleDistribution?.user || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Viewer</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {stats?.roleDistribution?.viewer || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
