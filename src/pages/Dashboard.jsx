// src/pages/Dashboard.jsx
import * as React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function Dashboard() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome Back!
      </Typography>
      <Grid container spacing={3}>
        {/* Customer Info Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Typography variant="h6">Account Overview</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography>Name: John Doe</Typography>
              <Typography>Email: john@example.com</Typography>
              <Typography>Member Since: April 2024</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Orders Card */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Typography variant="h6">Recent Orders</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography>Order #1234 - $59.99 - 03/25/2025</Typography>
              <Typography>Order #1233 - $29.99 - 03/20/2025</Typography>
              <Typography>Order #1232 - $89.99 - 03/15/2025</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Quick Actions</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <button>View All Orders</button>
              <button>Update Profile</button>
              <button>Contact Support</button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}