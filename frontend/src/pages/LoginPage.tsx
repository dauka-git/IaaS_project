import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Typography,
  Alert
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const LoginPage = () => {
  const { isAuthenticated, login, user } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const pendingPath = localStorage.getItem('pendingPath');
      if (pendingPath) {
        navigate(pendingPath);
        localStorage.removeItem('pendingPath');
      } else {
        navigate(`/home/${user._id || user.id}`);
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLoginSubmit = async (values: any) => {
    setLoading(true);
    setError('');
    try {
      await login(values.email, values.password);
      // Navigation handled by useEffect
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loginValidationSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required')
  });

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 5 }}>
      <Dialog open={true} onClose={() => navigate('/')} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" align="center">
            Sign In
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Welcome back to Mastercard IaaS
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginValidationSchema}
            onSubmit={handleLoginSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  name="email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                />
                <Field
                  as={TextField}
                  name="password"
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                />
                <DialogActions sx={{ mt: 2, justifyContent: 'space-between' }}>
                  <Button onClick={() => navigate('/register')} color="primary" disabled={loading}>
                    Need an account? Register
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Sign In'}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LoginPage; 