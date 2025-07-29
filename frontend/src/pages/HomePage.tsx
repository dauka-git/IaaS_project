

import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { 
  Button, 
  Typography, 
  Box, 
  Container,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { 
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

import Navbar from '../components/Navbar';
import AnimatedLogo from '../components/AnimatedLogo';
import BlockSpotlight from '../components/BlockSpotlight'

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

  return (
    <div>
      <Navbar/>
  
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box 
        sx={{ py: 6, position: 'relative'}}
        
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <BlockSpotlight
                byline='MASTERCARD SOLUTION'
                mainText={['Issuing-as-a-Service']}
                secondaryText='Accelerate your card issuing program with our comprehensive IaaS solution. Reduce costs, speed up time-to-market, and focus on your core business while we handle the complex infrastructure.'
              />
              
              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                mt: 4,
                flexWrap: 'wrap'
              }}>
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
                  sx={{ 
                    fontSize: '16px', 
                    fontWeight: 600,
                    padding: '14px 32px',
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Apply Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => handleNavClick(user?._id ? `/profile/${user._id}` : '/profile')}
                  sx={{ 
                    fontSize: '16px', 
                    fontWeight: 600,
                    padding: '14px 32px',
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  View Profile & Dashboard
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                // alignItems: 'center',
                // height: '100%',
                mt: {xs:4, md:0},

              }}>
                <AnimatedLogo 
                  width={500}
                  sx={{
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
                    borderRadius: 3,
                    zIndex:-1

                  }}
                />
          </Box>
            </Grid>
          </Grid>

          
        </Box>

        {/* Features Section */}
        <Box sx={{ pt: {xs:30, md:20}}}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h3" 
              component="h2"
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem' },
                mb: 2
              }}
            >
              Why Choose Mastercard IaaS?
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                maxWidth: 600,
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Everything you need to launch and scale your card program
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <SpeedIcon sx={{ 
                    fontSize: 64, 
                    color: 'primary.main', 
                    mb: 3
                  }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      mb: 2,
                      fontSize: '1.25rem'
                    }}
                  >
                    Fast Implementation
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    Get your card program up and running in weeks, not months. 
                    Our streamlined onboarding process gets you to market faster.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <TrendingUpIcon sx={{ 
                    fontSize: 64, 
                    color: 'primary.main', 
                    mb: 3
                  }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      mb: 2,
                      fontSize: '1.25rem'
                    }}
                  >
                    Cost Savings
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    Reduce capital expenditure and operational costs. 
                    Our pay-as-you-go model scales with your business.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <SecurityIcon sx={{ 
                    fontSize: 64, 
                    color: 'primary.main', 
                    mb: 3
                  }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      mb: 2,
                      fontSize: '1.25rem'
                    }}
                  >
                    Enterprise Security
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    Bank-grade security and compliance. 
                    PCI DSS, SOC 2, and regulatory requirements built-in.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <CreditCardIcon sx={{ 
                    fontSize: 64, 
                    color: 'primary.main', 
                    mb: 3
                  }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      mb: 2,
                      fontSize: '1.25rem'
                    }}
                  >
                    Flexible Solutions
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    Virtual and physical cards, custom branding, 
                    and API integration to fit your needs.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* ROI Calculator Section
        <Box sx={{ 
          py: 8, 
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center'
        }}>
          <Typography 
            variant="h4" 
            component="h2"
            sx={{ 
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '1.75rem', md: '2.125rem' }
            }}
          >
            Calculate Your ROI
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mb: 6,
              maxWidth: 500,
              mx: 'auto',
              fontWeight: 400
            }}
          >
            See how much you can save with our IaaS solution compared to building in-house
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            onClick={() => handleNavClick(`/apply/${user._id || user.id}`)}
            sx={{ 
              fontSize: '16px', 
              fontWeight: 600,
              padding: '14px 32px',
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Start ROI Calculator
          </Button>
        </Box> */}
      </Container>
    </div>
  );
};

export default HomePage;