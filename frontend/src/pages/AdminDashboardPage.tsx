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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';
import { Visibility as ViewIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { iaasAPI } from '../utils/api';
import { IaaSApplication, PaginatedResponse } from '../interfaces';
import { useUser } from '../components/UserContext';
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

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState<IaaSApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState<IaaSApplication | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user?.role === 'admin') {
      loadApplications();
    }
  }, [user, statusFilter, currentPage]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data: PaginatedResponse<IaaSApplication> = await iaasAPI.getAllApplications({
        status: statusFilter || undefined,
        page: currentPage,
        limit: 10
      });
      setApplications(data.applications);
      setTotalPages(data.pagination.total);
      setTotalApplications(data.pagination.totalApplications);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (applicationId: string) => {
    navigate(`/application/${applicationId}`);
  };

  const handleUpdateStatus = (application: IaaSApplication) => {
    setSelectedApplication(application);
    setUpdateStatus(application.status);
    setUpdateNotes(application.adminNotes || '');
    setUpdateDialogOpen(true);
  };

  const handleSaveUpdate = async () => {
    if (!selectedApplication) return;

    try {
      await iaasAPI.updateApplicationStatus(selectedApplication._id, {
        status: updateStatus,
        adminNotes: updateNotes
      });
      setUpdateDialogOpen(false);
      loadApplications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update application');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      <Navbar />

      <Box sx={{ mb: 4, mt:8 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and manage Mastercard IaaS applications.
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
                {totalApplications}
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

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Filter by Status"
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Under Review">Under Review</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
            <MenuItem value="Contacted">Contacted</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Applications Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>Cards</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                      No applications found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => {
                  const user = typeof application.userId === 'object' ? application.userId : null;
                  return (
                    <TableRow key={application._id}>
                      <TableCell>{application.company.name}</TableCell>
                      <TableCell>
                        {user && (
                          <Box>
                            <Typography variant="body2">
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>{application.contact.industry}</TableCell>
                      <TableCell>
  {application.roiInputs?.cards_number?.toLocaleString() || 
   (application.roiInputs?.explicit_cards_number && 
    Object.values(application.roiInputs.explicit_cards_number).slice(-1)[0]?.toLocaleString()) || 
   'N/A'}
</TableCell>
                      
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
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewApplication(application._id)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleUpdateStatus(application)}
                          >
                            Update
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
          color="primary"
        />
      </Box>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Application Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Status
              </Typography>
              <RadioGroup
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
              >
                <FormControlLabel value="Pending" control={<Radio />} label="Pending" />
                <FormControlLabel value="Under Review" control={<Radio />} label="Under Review" />
                <FormControlLabel value="Approved" control={<Radio />} label="Approved" />
                <FormControlLabel value="Rejected" control={<Radio />} label="Rejected" />
                <FormControlLabel value="Contacted" control={<Radio />} label="Contacted" />
              </RadioGroup>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Admin Notes"
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="Add any notes about this application..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveUpdate} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 