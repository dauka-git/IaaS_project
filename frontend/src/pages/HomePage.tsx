import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { 
  Button, 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Container,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { 
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const HomePage = () => {
  const { isAuthenticated, user } = useUser();
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    if (path === '/') {
      navigate(path);
      return;
    }

    if (!isAuthenticated) {
      localStorage.setItem('pendingPath', path);
      navigate('/register');
    } else {
      navigate(path);
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            <Button color="inherit" onClick={() => handleNavClick('/')}>
              Mastercard IaaS
            </Button>
          </Typography>
          
          {isAuthenticated ? (
            <>
              <Button color="inherit" onClick={() => handleNavClick(user?._id ? `/dashboard/${user._id}` : '/dashboard')}>
                Dashboard
              </Button>
              {user?.role === 'admin' && (
                <Button color="inherit" onClick={() => handleNavClick('/admin')}>
                  Admin
                </Button>
              )}
              <Button color="inherit" onClick={() => handleNavClick(`/profile/${user?._id || user?.id}`)}>
                Profile
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={goToLogin}>
                Login
              </Button>
              <Button color="inherit" onClick={goToRegister}>
                Sign Up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
  
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            gap: 4,
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Mastercard Issuing-as-a-Service
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600 }}>
            Accelerate your card issuing program with our comprehensive IaaS solution. 
            Reduce costs, speed up time-to-market, and focus on your core business.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                if (isAuthenticated && (user?._id || user?.id)) {
                  handleNavClick(`/apply/${user._id || user.id}`);
                } else {
                  handleNavClick('/register');
                }
              }}
              sx={{ fontSize: '18px', padding: '12px 24px' }}
            >
              Apply Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => handleNavClick(user?._id ? `/dashboard/${user._id}` : '/dashboard')}
              sx={{ fontSize: '18px', padding: '12px 24px' }}
            >
              View Dashboard
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography variant="h3" align="center" gutterBottom>
            Why Choose Mastercard IaaS?
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <SpeedIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Fast Implementation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get your card program up and running in weeks, not months. 
                    Our streamlined onboarding process gets you to market faster.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <TrendingUpIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Cost Savings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reduce capital expenditure and operational costs. 
                    Our pay-as-you-go model scales with your business.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Enterprise Security
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bank-grade security and compliance. 
                    PCI DSS, SOC 2, and regulatory requirements built-in.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <CreditCardIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Flexible Solutions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Virtual and physical cards, custom branding, 
                    and API integration to fit your needs.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* ROI Calculator Preview */}
        <Box sx={{ py: 8, bgcolor: 'grey.50', borderRadius: 2, px: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Calculate Your ROI
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            See how much you can save with our IaaS solution compared to building in-house
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => handleNavClick('/apply')}
              sx={{ fontSize: '18px', padding: '12px 24px' }}
            >
              Start ROI Calculator
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default HomePage;