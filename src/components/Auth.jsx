import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  auth,
  db,
  sendPasswordResetEmail
} from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import {
  Alert,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link
} from '@mui/material';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [resetEmail, setResetEmail] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeTab === 0) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await addDoc(collection(db, "users"), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name,
          createdAt: new Date()
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setError('Please enter your email');
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setResetLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    const errors = {
      'auth/email-already-in-use': 'Email already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/too-many-requests': 'Too many attempts. Try again later.',
      'auth/network-request-failed': 'Network error. Check your connection.'
    };
    return errors[code] || 'An error occurred. Please try again.';
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => {
            setActiveTab(newValue);
            setError('');
          }}
          centered
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {activeTab === 1 && (
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            inputProps={{ minLength: 6 }}
          />

          {activeTab === 0 && (
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => setResetDialogOpen(true)}
              sx={{ display: 'block', textAlign: 'right', mt: 1 }}
            >
              Forgot password?
            </Link>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : activeTab === 0 ? 'Login' : 'Register'}
          </Button>
        </form>
      </Paper>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {resetSuccess ? (
            <Alert severity="success">
              We've sent a password reset link to {resetEmail}
            </Alert>
          ) : (
            <>
              <Typography gutterBottom>
                Enter your email to receive a reset link:
              </Typography>
              <TextField
                autoFocus
                fullWidth
                margin="normal"
                label="Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setResetDialogOpen(false);
            setResetSuccess(false);
          }}>
            Close
          </Button>
          {!resetSuccess && (
            <Button
              onClick={handleResetPassword}
              color="primary"
              disabled={!resetEmail || resetLoading}
            >
              {resetLoading ? <CircularProgress size={24} /> : 'Send Link'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}