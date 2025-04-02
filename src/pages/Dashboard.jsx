import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { 
  Container, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Box
} from '@mui/material';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        // Fetch user details from Firestore
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          setUserData(userDoc);
        }

        // Fetch orders
        const ordersRef = collection(db, 'orders');
        const ordersQuery = query(ordersRef, where('userId', '==', user.uid));
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to open demo.html (Store Locator) in a new tab
  const handleSearchProduct = () => {
    window.open('/demo.html', '_blank'); 
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ 
        py: 4, 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh'
      }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
            {userData?.name?.charAt(0) || 'U'}
          </Avatar>
          <div>
            <Typography variant="h4" component="h1">
              Welcome, {userData?.name || 'Customer'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {auth.currentUser?.email}
            </Typography>
          </div>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSearchProduct} // Open the map
          sx={{ mb: 2 }}
        >
          Search Product
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          sx={{ mb: 4, ml: 2 }}
        >
          Logout
        </Button>

        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Your Orders
        </Typography>

        {orders.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id.substring(0, 8)}</TableCell>
                    <TableCell>
                      {new Date(order.date?.toDate()).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.items?.length || 0}</TableCell>
                    <TableCell>${order.total?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <Typography 
                        color={
                          order.status === 'Delivered' ? 'success.main' : 
                          order.status === 'Processing' ? 'warning.main' : 
                          'text.primary'
                        }
                      >
                        {order.status || 'Pending'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" color="text.secondary">
            You haven't placed any orders yet.
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
