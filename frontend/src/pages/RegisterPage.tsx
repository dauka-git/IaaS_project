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
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import zxcvbn from 'zxcvbn';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';
import validator from 'validator';

const countryOptions = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'RU', name: 'Russia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  // ...add more as needed
];

const RegisterPage = () => {
  const { isAuthenticated, login, register } = useUser();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const phoneUtil = PhoneNumberUtil.getInstance();

  useEffect(() => {
    if (isAuthenticated) {
      const pendingPath = localStorage.getItem('pendingPath');
      if (pendingPath) {
        navigate(pendingPath);
        localStorage.removeItem('pendingPath');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, navigate]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const value = e.target.value;
    setFieldValue('password', value);
    const result = zxcvbn(value);
    setPasswordStrength(result.score);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    let value = e.target.value;
    try {
      const number = phoneUtil.parseAndKeepRawInput(value, selectedCountry);
      value = phoneUtil.format(number, PhoneNumberFormat.INTERNATIONAL);
    } catch {
      // keep raw input if not valid
    }
    setFieldValue('phone', value);
  };

  const registerValidationSchema = Yup.object({
    bin: Yup.string().required('BIN is required'),
    email: Yup.string()
      .required('Email is required')
      .test('is-valid-email', 'Invalid email', value => validator.isEmail(value || '')),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    company: Yup.string(),
    phone: Yup.string()
      .test('is-valid-phone', 'Invalid phone number', value => {
        if (!value) return true;
        try {
          const number = phoneUtil.parseAndKeepRawInput(value, selectedCountry);
          return phoneUtil.isValidNumber(number);
        } catch {
          return false;
        }
      }),
  });

  const handleAuthSubmit = async (values: any) => {
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await register({
          bin: values.bin,
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          company: values.company,
          phone: values.phone
        });
      } else {
        await login(values.email, values.password);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 5 }}>
      <Dialog open={true} onClose={() => navigate('/')} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" align="center">
            {isRegister ? 'Create Account' : 'Sign In'}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            {isRegister ? 'Join Mastercard IaaS Platform' : 'Welcome back to Mastercard IaaS'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Formik
            initialValues={isRegister ? {
              bin: '',
              email: '',
              password: '',
              firstName: '',
              lastName: '',
              company: '',
              phone: ''
            } : {
              email: '',
              password: ''
            }}
            validationSchema={registerValidationSchema}
            onSubmit={handleAuthSubmit}
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form>
                {isRegister && (
                  <>
                    <Field
                      as={TextField}
                      name="firstName"
                      label="First Name"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      error={touched.firstName && !!errors.firstName}
                      helperText={touched.firstName && errors.firstName}
                    />
                    <Field
                      as={TextField}
                      name="lastName"
                      label="Last Name"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      error={touched.lastName && !!errors.lastName}
                      helperText={touched.lastName && errors.lastName}
                    />
                    <Field
                      as={TextField}
                      name="bin"
                      label="BIN"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      error={touched.bin && !!errors.bin}
                      helperText={touched.bin && errors.bin}
                    />
                    <Field
                      as={TextField}
                      name="company"
                      label="Company (Optional)"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      error={touched.company && !!errors.company}
                      helperText={touched.company && errors.company}
                    />
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Country</InputLabel>
                      <Select
                        value={selectedCountry}
                        label="Country"
                        onChange={e => setSelectedCountry(e.target.value)}
                      >
                        {countryOptions.map(country => (
                          <MenuItem key={country.code} value={country.code}>
                            {country.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Field
                      as={TextField}
                      name="phone"
                      label="Phone (Optional)"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      error={touched.phone && !!errors.phone}
                      helperText={touched.phone && errors.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePhoneChange(e, setFieldValue)}
                      value={values.phone}
                    />
                  </>
                )}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange(e, setFieldValue)}
                  value={values.password}
                />
                {isRegister && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color={
                      passwordStrength < 2 ? 'error' : passwordStrength === 2 ? 'warning.main' : 'success.main'
                    }>
                      Password strength: {['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]}
                    </Typography>
                  </Box>
                )}
                <DialogActions sx={{ mt: 2, justifyContent: 'space-between' }}>
                  <Button
                    onClick={() => {
                      setIsRegister(!isRegister);
                      setError('');
                    }}
                    color="primary"
                    disabled={loading}
                  >
                    {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || (isRegister && passwordStrength < 2)}
                  >
                    {loading ? 'Processing...' : (isRegister ? 'Register' : 'Sign In')}
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

export default RegisterPage;