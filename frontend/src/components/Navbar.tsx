import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button,} from '@mui/material';
import { useUser } from './UserContext';

const Navbar = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const userId = user?._id || user?.id;

  // Only show Home and Dashboard on profile page
  const isProfilePage = /^\/profile(\/[^/]+)?$/.test(location.pathname);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          <Button color="inherit" onClick={() => handleNavClick('/')}>
            Home
          </Button>
        </Typography>
        {isProfilePage ? (
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
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;