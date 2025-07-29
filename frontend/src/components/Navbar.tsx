import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar,  Button, Box } from '@mui/material';
import MastercardIcon from './McIcon';
import { useUser } from './UserContext';


const Navbar = () => {
  const { isAuthenticated, user, logout } = useUser();
  
  const navigate = useNavigate();
  const location = useLocation();

  
  const userId = user?._id || user?.id;

  const isProfilePage = /^\/profile(\/[^/]+)?$/.test(location.pathname);

  const isHomePage = /^\/$|^\/index\.html$/i.test(location.pathname);

  const isApplicationFormPage = /^\/apply(\/[a-f0-9]{24})?$/i.test(location.pathname);



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

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
          py: 0.5,  
          minHeight: 44, 
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

          {isHomePage || isApplicationFormPage ? (

            isAuthenticated ? (
              <>
                
                {user?.role === 'admin' && (
                  <Button 
                    sx={{ 
                     
                    fontSize: 14
                    }}
                    color="inherit" onClick={() => handleNavClick('/admin/dashboard')}
                  >
                    Admin
                  </Button>
                )}
                { !isProfilePage && (                <Button 
                  sx={{ 
                     
                    fontSize: 14
                  }}
                  color="inherit" onClick={() => handleNavClick(`/profile/${user?._id || user?.id}`)}
                >
                  Profile
                </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  sx={{ 
                     
                    fontSize: 14
                  }}
                  color="inherit" onClick={goToLogin}
                >
                  Login
                </Button>
                <Button
                  sx={{ 
                     
                    fontSize: 14
                  }}
                  color="inherit" onClick={goToRegister}
                >
                  Sign Up
                </Button>
              </>
            )

          ): isProfilePage ? (
            <>
              <Button 
                sx={{ 
                      
                      fontSize: 14
                    }}
                color="inherit" onClick={handleLogout}
              >
                Log out
              </Button>
            </>
          ) : (
            isAuthenticated && (
              <Button 
                sx={{ fontSize: 14 }}
                color="inherit" 
                onClick={() => handleNavClick(`/profile/${userId}`)}
              >
                Profile
              </Button>
            )
          )}

        </Box>
        

        
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;