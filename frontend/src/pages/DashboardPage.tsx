import { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { iaasAPI } from '../utils/api';
import { IaaSApplication } from '../interfaces';
import { useUser } from '../components/UserContext';

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

export default function DashboardPage() {
  const [applications, setApplications] = useState<IaaSApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null); // For fallback user info
  const navigate = useNavigate();
  const { user } = useUser();
  const { userId } = useParams();

  // Always use userId from URL if present
  const effectiveUserId = userId || user?._id || user?.id;

  useEffect(() => {
    if (effectiveUserId) {
      loadApplications();
      if (!user && userId) {
        // Fallback: fetch user profile for welcome message
        fetch(`/api/profile/${userId}`)
          .then(res => res.json())
          .then(setProfile)
          .catch(() => {});
      }
    }
    // eslint-disable-next-line
  }, [effectiveUserId]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      if (!effectiveUserId) {
        setApplications([]);
        setLoading(false);
        return;
      }
      const data = await iaasAPI.getUserApplications(effectiveUserId as string);
      setApplications(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleNewApplication = () => {
    navigate('/apply');
  };

  const handleViewApplication = (applicationId: string) => {
    navigate(`/application/${applicationId}`);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.firstName || profile?.firstName || 'User'}! Manage your Mastercard IaaS applications.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
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
        <Grid item xs={12} md={3}>
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
        <Grid item xs={12} md={3}>
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
        <Grid item xs={12} md={3}>
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

      {/* Actions */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewApplication}
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
                <TableCell>Industry</TableCell>
                <TableCell>Cards</TableCell>
                <TableCell>Monthly Volume</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                      No applications yet. Start by creating your first application!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => (
                  <TableRow key={application._id}>
                    <TableCell>{application.companyName}</TableCell>
                    <TableCell>{application.industry}</TableCell>
                    <TableCell>{application.numberOfCards.toLocaleString()}</TableCell>
                    <TableCell>${application.expectedMonthlyVolume.toLocaleString()}</TableCell>
                    <TableCell>{application.timeline}</TableCell>
                    <TableCell>
                      <Chip
                        label={application.status}
                        color={getStatusColor(application.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(application.createdAt).toLocaleDateString()}
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
    </Container>
  );
} 