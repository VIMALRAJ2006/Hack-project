import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Button,
  Avatar, Divider, List, ListItem, ListItemAvatar,
  ListItemText, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Tabs, Tab, Alert,
  CircularProgress
} from '@mui/material';
import {
  ShoppingCart, Person, Email, CalendarToday,
  ContactSupport, Edit, History, Lock, PersonAdd
} from '@mui/icons-material';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase';

// Quick Action Button Component
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize Firebase Auth
  const auth = getAuth();

  // Check auth state on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in
        const q = query(collection(db, "users"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setCurrentUser({
            id: user.uid,
            email: user.email,
            ...querySnapshot.docs[0].data()
          });
        }
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleAuthTabChange = (event, newValue) => {
    setAuthTab(newValue);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (authTab === 0) {
        // Login flow
        const { user } = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const q = query(collection(db, "users"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        
        setCurrentUser({
          id: user.uid,
          email: user.email,
          ...querySnapshot.docs[0].data()
        });
      } else {
        // Signup flow
        const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await addDoc(collection(db, "users"), {
          email: user.email,
          name: formData.name,
          joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          createdAt: new Date()
        });
        
        setCurrentUser({
          id: user.uid,
          email: user.email,
          name: formData.name,
          joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });
      }
      setAuthOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Show auth screen if not logged in
  if (!currentUser) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Paper sx={{ p: 4 }}>
          <Lock color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Welcome to Our Platform
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Please authenticate to access your dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Person />}
              onClick={() => {
                setAuthTab(0);
                setAuthOpen(true);
                setError('');
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
                setError('');
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Paper>

        <Dialog open={authOpen} onClose={() => !loading && setAuthOpen(false)}>
          <DialogTitle>
            <Tabs value={authTab} onChange={handleAuthTabChange} centered>
              <Tab label="Login" disabled={loading} />
              <Tab label="Sign Up" disabled={loading} />
            </Tabs>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2, minWidth: 400 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {authTab === 0 ? (
                <>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled={loading}
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
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    margin="normal"
                    disabled={loading}
                    helperText="At least 6 characters"
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAuthOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAuth}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {authTab === 0 ? 'Login' : 'Create Account'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  // Show dashboard for authenticated users
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

      <Grid container spacing={3}>
        {/* Account Overview Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Account Overview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ 
                width: 56, 
                height: 56, 
                mr: 2, 
                bgcolor: 'primary.main',
                fontSize: '1.5rem'
              }}>
                {currentUser.name.charAt(0).toUpperCase()}
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
                <ListItemText 
                  primary="Member Since" 
                  secondary={currentUser.joinDate} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Recent Orders Card */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="h2">
                Recent Activity
              </Typography>
              <Button size="small" startIcon={<History />}>
                View History
              </Button>
            </Box>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" color="text.secondary">
              {currentUser.orders?.length > 0 ? (
                <List>
                  {currentUser.orders.slice(0, 3).map(order => (
                    <ListItem key={order.id}>
                      <ListItemAvatar>
                        <ShoppingCart color="secondary" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={`Order #${order.id}`}
                        secondary={`${order.date} • $${order.amount.toFixed(2)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                'No recent activity'
              )}
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
                label="View Orders" 
              />
              <QuickActionButton 
                icon={<Edit />} 
                label="Edit Profile" 
              />
              <QuickActionButton 
                icon={<ContactSupport />} 
                label="Get Help"
                color="secondary"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}