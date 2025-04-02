import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Container, Typography, Button, Paper } from '@mui/material';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/auth');
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Your Dashboard
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={() => auth.signOut()}
        >
          Logout
        </Button>
      </Paper>
    </Container>
  );
}