

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon, AccountCircle as AccIcon } from '@mui/icons-material';
import { iaasAPI, authAPI } from '../utils/api';
import { IaaSApplication } from '../interfaces';
import Navbar from '../components/Navbar';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Under Review':
      return 'info';
    case 'Approved':
      return 'success';
    case 'Rejected':
      return 'error';
    case 'Contacted':
      return 'primary';
    default:
      return 'default';
  }
};

// const ProfilePage = () => {
//   const { userId } = useParams<{ userId: string }>();
//   const { isAuthenticated, user } = useUser();
//   const navigate = useNavigate();
//   const [profile, setProfile] = useState<any>(null);
//   const [applications, setApplications] = useState<IaaSApplication[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Always use userId from URL if present, otherwise use current user's ID
//   const effectiveUserId = userId || user?._id;

//   useEffect(() => {
//     console.log('ProfilePage useEffect - isAuthenticated:', isAuthenticated, 'effectiveUserId:', effectiveUserId, 'user:', user);
    
//     if (!isAuthenticated) {
//       console.log('Redirecting to register - not authenticated');
//       navigate('/register');
//       return;
//     }

//     if (!effectiveUserId) {
//       console.log('No effectiveUserId found, user:', user);
//       navigate('/register');
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         console.log('Token available:', !!token);
        
//         if (!token) {
//           console.log('No token found, redirecting to register');
//           navigate('/register');
//           return;
//         }

//         console.log('Fetching profile for userId:', effectiveUserId);
        
//         // Fetch profile data using authAPI
//         try {
//           console.log('Making API call to:', `/profile/${effectiveUserId}`);
//           const profileData = await authAPI.getProfile(effectiveUserId as string);
//           console.log('Profile data received:', profileData);
//           setProfile(profileData);
//         } catch (profileErr: any) {
//           console.error('Profile fetch error:', profileErr);
//           console.error('Error response:', profileErr.response);
//           throw new Error(`Profile fetch failed: ${profileErr.response?.data?.message || profileErr.message}`);
//         }

//         // Fetch applications data
//         console.log('Fetching applications for userId:', effectiveUserId);
//         try {
//           const applicationsData = await iaasAPI.getUserApplications(effectiveUserId as string);
//           console.log('Applications data received:', applicationsData);
//           setApplications(applicationsData);
//         } catch (applicationsErr: any) {
//           console.error('Applications fetch error:', applicationsErr);
//           // Don't throw here, just log the error and continue with empty applications
//           setApplications([]);
//         }

//       } catch (err: any) {
//         console.error('Error in fetchData:', err);
//         setError(err.response?.data?.message || err.message || 'Error loading data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [isAuthenticated, effectiveUserId, navigate]);

//   const handleNewApplication = () => {
//     navigate('/apply');
//   };

//   const handleViewApplication = (applicationId: string) => {
//     navigate(`/application/${applicationId}`);
//   };

//   if (loading) {
//     return (
//       <div>
//         <Navbar />
//         <Container sx={{ py: 4, textAlign: 'center' }}>
//           <CircularProgress />
//         </Container>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div>
//         <Navbar />
//         <Container sx={{ py: 4 }}>
//           <Alert severity="error">{error}</Alert>
//         </Container>
//       </div>
//     );
//   }

//   if (!profile) return null;

//   return (
//     <div>
//       <Navbar />
//       <Container maxWidth="lg" sx={{ py: 5, pt:12 }}>
//         {/* Profile Header */}
//         {/* <Box sx={{ mb: 4 }}>
//           <Typography variant="h4" gutterBottom>
//             Profile & Dashboard
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             Welcome back, {profile.firstName} {profile.lastName}! Manage your profile and Mastercard IaaS applications.
//           </Typography>
//         </Box> */}

//         {/* Profile Information Card */}
       
//           <Paper sx={{ p: 3, mb: 4,  }}>
//               <Box display={'flex'} alignItems={'center'}>

//                 <Box display={'flex'} flexDirection={'column'} alignItems={'center'} marginRight={4}>
//                   <AccIcon sx={{
//                     width:'100px',
//                     height: '100px',
//                     mb:3
//                   }}/>
//                   <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
//                     Profile 
//                   </Typography>  
//                 </Box>  

//               <Grid container spacing={3}>
//                 <Grid item xs={12} sm={5}>
//                   <Typography variant="body2" color="text.secondary">Name</Typography>
//                   <Typography variant="body1" sx={{ mb: 2 }}>
//                     {profile.firstName} {profile.lastName}
//                   </Typography>
//                 </Grid>
//                 <Grid item xs={12} sm={5}>
//                   <Typography variant="body2" color="text.secondary">Email</Typography>
//                   <Typography variant="body1" sx={{ mb: 2 }}>
//                     {profile.email}
//                   </Typography>
//                 </Grid>
//                 {profile.company && (
//                   <Grid item xs={12} sm={5}>
//                     <Typography variant="body2" color="text.secondary">Company</Typography>
//                     <Typography variant="body1" sx={{ mb: 2 }}>
//                       {profile.company}
//                     </Typography>
//                   </Grid>
//                 )}
//                 {/* {profile.role && (
//                   <Grid item xs={12} sm={6}>
//                     <Typography variant="body2" color="text.secondary">Role</Typography>
//                     <Typography variant="body1" sx={{ mb: 2 }}>
//                       {profile.role}
//                     </Typography>
//                   </Grid>
//                 )} */}
//                 {profile.bin && (
//                   <Grid item xs={12} sm={5}>
//                     <Typography variant="body2" color="text.secondary">BIN</Typography>
//                     <Typography variant="body1" sx={{ mb: 2 }}>
//                       {profile.bin}
//                     </Typography>
//                   </Grid>
//                 )}
//                 {profile.phone && (
//                   <Grid item xs={12} sm={5}>
//                     <Typography variant="body2" color="text.secondary">Phone</Typography>
//                     <Typography variant="body1" sx={{ mb: 2 }}>
//                       {profile.phone}
//                     </Typography>
//                   </Grid>
//                 )}
//               </Grid>
//             </Box>

//           </Paper>

//         <Divider sx={{ mb: 4 }} />

//         {/* Applications Dashboard Section */}
//         <Box sx={{ mb: 3 }}>
//           <Typography variant="h5" gutterBottom>
//             IaaS Applications Dashboard
//           </Typography>
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//             Track and manage your Mastercard IaaS applications
//           </Typography>
//         </Box>

//         {/* Summary Cards */}
//         <Grid container spacing={3} sx={{ mb: 4 }}>
//           <Grid item xs={12} md={3}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" color="primary">
//                   {applications.length}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Total Applications
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" color="warning.main">
//                   {applications.filter(app => app.status === 'Pending').length}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Pending Review
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" color="success.main">
//                   {applications.filter(app => app.status === 'Approved').length}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Approved
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" color="info.main">
//                   {applications.filter(app => app.status === 'Under Review').length}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Under Review
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>

//         {/* Actions */}
//         <Box sx={{ mb: 3 }}>
//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             onClick={handleNewApplication}
//           >
//             New Application
//           </Button>
//         </Box>

//         {/* Applications Table */}
//         <Paper>
//           <TableContainer>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell>Company</TableCell>
//                   <TableCell>Industry</TableCell>
//                   <TableCell>Cards</TableCell>
//                   <TableCell>Timeline</TableCell>
//                   <TableCell>Status</TableCell>
//                   <TableCell>Created</TableCell>
//                   <TableCell>Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//   {applications.length === 0 ? (
//     <TableRow>
//       <TableCell colSpan={7} align="center">
//         <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
//           No applications yet. Start by creating your first application!
//         </Typography>
//       </TableCell>
//     </TableRow>
//   ) : (
//     applications.map((application) => (
//       <TableRow key={application._id}>
//         <TableCell>{application.companyName || 'N/A'}</TableCell>
//         <TableCell>{application.industry || 'N/A'}</TableCell>
//         <TableCell>
//           {application.numberOfCards ? application.numberOfCards.toLocaleString() : 'N/A'}
//         </TableCell> 
//         <TableCell>{application.timeline || 'N/A'}</TableCell>
//         <TableCell>
//           <Chip
//             label={application.status || 'Unknown'}
//             color={getStatusColor(application.status || 'default') as any}
//             size="small"
//           />
//         </TableCell>
//         <TableCell>
//           {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}
//         </TableCell>
//         <TableCell>
//           <Button
//             size="small"
//             startIcon={<ViewIcon />}
//             onClick={() => handleViewApplication(application._id)}
//           >
//             View
//           </Button>
//         </TableCell>
//       </TableRow>
//     ))
//   )}
// </TableBody>
//             </Table>
//           </TableContainer>
//         </Paper>
//       </Container>
//     </div>
//   );
// };

// export default ProfilePage;


// ... (keep all your imports the same)

const ProfilePage = () => {
  // ... (keep all your existing state and effect hooks)

  const { userId } = useParams<{ userId: string }>();
  const { isAuthenticated, user } = useUser();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<IaaSApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Always use userId from URL if present, otherwise use current user's ID
  const effectiveUserId = userId || user?._id;

  useEffect(() => {
    console.log('ProfilePage useEffect - isAuthenticated:', isAuthenticated, 'effectiveUserId:', effectiveUserId, 'user:', user);
    
    if (!isAuthenticated) {
      console.log('Redirecting to register - not authenticated');
      navigate('/register');
      return;
    }

    if (!effectiveUserId) {
      console.log('No effectiveUserId found, user:', user);
      navigate('/register');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token available:', !!token);
        
        if (!token) {
          console.log('No token found, redirecting to register');
          navigate('/register');
          return;
        }

        console.log('Fetching profile for userId:', effectiveUserId);
        
        // Fetch profile data using authAPI
        try {
          console.log('Making API call to:', `/profile/${effectiveUserId}`);
          const profileData = await authAPI.getProfile(effectiveUserId as string);
          console.log('Profile data received:', profileData);
          setProfile(profileData);
        } catch (profileErr: any) {
          console.error('Profile fetch error:', profileErr);
          console.error('Error response:', profileErr.response);
          throw new Error(`Profile fetch failed: ${profileErr.response?.data?.message || profileErr.message}`);
        }

        // Fetch applications data
        console.log('Fetching applications for userId:', effectiveUserId);
        try {
          const applicationsData = await iaasAPI.getUserApplications(effectiveUserId as string);
          console.log('Applications data received:', applicationsData);
          setApplications(applicationsData);
        } catch (applicationsErr: any) {
          console.error('Applications fetch error:', applicationsErr);
          // Don't throw here, just log the error and continue with empty applications
          setApplications([]);
        }

      } catch (err: any) {
        console.error('Error in fetchData:', err);
        setError(err.response?.data?.message || err.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, effectiveUserId, navigate]);

  const handleNewApplication = () => {
    navigate(`/apply/${effectiveUserId}`);
  };

  const handleViewApplication = (applicationId: string) => {
    navigate(`/application/${applicationId}`);
  };




  if (loading) {
    return (
      <div>
        <Navbar />
        <Container sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <Container sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 5, pt: 12 }}>
        <Grid container spacing={4}>
          {/* Left Column - Profile Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <AccIcon sx={{ width: '100px', height: '100px', mb: 3 }} />
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                  Profile 
                </Typography>
                
                <Box width="100%">
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {profile.firstName} {profile.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {profile.email}
                      </Typography>
                    </Grid>
                    {profile.company && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Company</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {profile.company}
                        </Typography>
                      </Grid>
                    )}
                    {profile.bin && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">BIN</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {profile.bin}
                        </Typography>
                      </Grid>
                    )}
                    {profile.phone && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Phone</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {profile.phone}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Dashboard */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Applications dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Track and manage your applications
              </Typography>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={6} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {applications.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Applications
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="warning.main">
                      {applications.filter(app => app.status === 'Pending').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Review
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="success.main">
                      {applications.filter(app => app.status === 'Approved').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approved
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="info.main">
                      {applications.filter(app => app.status === 'Under Review').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Under Review
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* New Application Button */}
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewApplication}
                fullWidth
              >
                New Application
              </Button>
            </Box>

            {/* Applications Table */}
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Company</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                            No applications yet
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      applications.map((application) => (
                        <TableRow key={application._id}>
                          <TableCell>{application.company?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={application.status || 'Unknown'}
                              color={getStatusColor(application.status || 'default') as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<ViewIcon />}
                              onClick={() => handleViewApplication(application._id)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default ProfilePage;