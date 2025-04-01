import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import {
  ShoppingCart,
  Person,
  Email,
  CalendarToday,
  ContactSupport,
  Edit,
  History,
  Lock,
  PersonAdd
} from '@mui/icons-material';

// Mock user database
const mockUsers = [
  { email: 'john@example.com', password: 'password123', name: 'John Doe', joinDate: 'April 2024' }
];

const QuickActionButton = ({ icon, label, ...props }) => (
  <Button 
    variant="outlined" 
    startIcon={icon}
    sx={{ flex: 1, py: 1.5, borderRadius: 2, textTransform: 'none' }}
    {...props}
  >
    {label}
  </Button>
);

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState(0);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const handleAuthTabChange = (event, newValue) => {
    setAuthTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = () => {
    const user = mockUsers.find(u => u.email === formData.email && u.password === formData.password);
    if (user) {
      setCurrentUser(user);
      setAuthOpen(false);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleSignup = () => {
    if (mockUsers.some(u => u.email === formData.email)) {
      alert('Email already exists');
      return;
    }
    const newUser = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    mockUsers.push(newUser);
    setCurrentUser(newUser);
    setAuthOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Paper sx={{ p: 4 }}>
          <Lock color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Welcome to Our Platform
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Please log in to access your dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<Person />}
              onClick={() => {
                setAuthTab(0);
                setAuthOpen(true);
              }}
            >
              Login
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              startIcon={<PersonAdd />}
              onClick={() => {
                setAuthTab(1);
                setAuthOpen(true);
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Paper>

        <Dialog open={authOpen} onClose={() => setAuthOpen(false)}>
          <DialogTitle>
            <Tabs value={authTab} onChange={handleAuthTabChange} centered>
              <Tab label="Login" />
              <Tab label="Sign Up" />
            </Tabs>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2, minWidth: 400 }}>
              {authTab === 0 ? (
                <>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAuthOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={authTab === 0 ? handleLogin : handleSignup}
            >
              {authTab === 0 ? 'Login' : 'Sign Up'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  // User is authenticated - show dashboard
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Welcome Back, {currentUser.name}!
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Person />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Rest of your dashboard content */}
      <Grid container spacing={3}>
        {/* Account Overview Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Account Overview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}
              >
                {currentUser.name.charAt(0)}
              </Avatar>
              <Typography variant="subtitle1">{currentUser.name}</Typography>
            </Box>
            
            <List dense>
              <ListItem>
                <ListItemAvatar>
                  <Email color="primary" />
                </ListItemAvatar>
                <ListItemText primary="Email" secondary={currentUser.email} />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <CalendarToday color="primary" />
                </ListItemAvatar>
                <ListItemText primary="Member Since" secondary={currentUser.joinDate} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Recent Orders Card */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="h2">
                Recent Orders
              </Typography>
              <Button size="small" startIcon={<History />}>
                View All
              </Button>
            </Box>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" color="text.secondary">
              You haven't placed any orders yet.
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <QuickActionButton 
                icon={<ShoppingCart />} 
                label="View All Orders" 
              />
              <QuickActionButton 
                icon={<Edit />} 
                label="Update Profile" 
              />
              <QuickActionButton 
                icon={<ContactSupport />} 
                label="Contact Support"
                color="secondary"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}