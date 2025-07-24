import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar,  Button, Box } from '@mui/material';
import MastercardIcon from './McIcon';
import { useUser } from './UserContext';
// import <McIcon</McIcon>


const Navbar = () => {
  const { isAuthenticated, user } = useUser();
  
  const navigate = useNavigate();
  const location = useLocation();

  
  const userId = user?._id || user?.id;

  // Only show Home and Dashboard on profile page
  const isProfilePage = /^\/profile(\/[^/]+)?$/.test(location.pathname);

  const isHomePage = /^\/$|^\/index\.html$/i.test(location.pathname);


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
    <AppBar sx={{
        
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 10
    }}>

      
      <Toolbar sx={{
          width: "100%",
          maxWidth: '100%',
          marginX: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 0.5,  // even less height
          minHeight: 44, // set a minimum height for compactness
          px: 2,   
          bgcolor: 'transparent',
          '@media (min-width:900px)': {  
            px: 4  
          },
          '@media (min-width:1200px)': {  
            px: 1  
          }
        }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box sx={{ cursor: 'pointer', mr: 2 }} onClick={() => handleNavClick('/')}>
            <MastercardIcon width={56} height={42} />
          </Box>
        </Box>


        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

          {isHomePage ? (

            isAuthenticated ? (
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
            )

          ): isProfilePage ? (
            <Button color="inherit" onClick={() => handleNavClick(userId ? `/dashboard/${userId}` : '/dashboard')}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button color="inherit" onClick={() => handleNavClick(userId ? `/profile/${userId}` : '/login')}>
                Profile
              </Button>
              <Button color="inherit" onClick={() => handleNavClick('/register')}>
                Sign Up
              </Button>
            </>
          )}

        </Box>
        

        
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;