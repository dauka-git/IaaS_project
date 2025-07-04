import  { useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      navigate('/register');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/register');
          return;
        }

        const response = await fetch(`/api/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const profileData = await response.json();
        setProfile(profileData);
      } catch (err) {
        setError('Error loading profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, userId, navigate]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!profile) return null;

  return (
    <div>
      <Navbar/>
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Profile: {profile.firstName} {profile.lastName}
        </Typography>
        <Typography>Email: {profile.email}</Typography>
        <Typography>BIN: {profile.bin}</Typography>
        <Typography>Company: {profile.company}</Typography>
        <Typography>Role: {profile.role}</Typography>
        {/* Add more fields as needed */}
      </Box>
    </div>
  );
};

export default ProfilePage;