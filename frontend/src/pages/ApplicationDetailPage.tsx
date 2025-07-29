import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Chip,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { iaasAPI } from '../utils/api';
import Navbar from '../components/Navbar';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'warning';
    case 'Under Review': return 'info';
    case 'Approved': return 'success';
    case 'Rejected': return 'error';
    case 'Contacted': return 'primary';
    default: return 'default';
  }
};

const ApplicationDetailPage = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const data = await iaasAPI.getApplication(applicationId!);
      setApplication(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
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

  if (!application) return null;

  return (
    <div>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4, pt: 12 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" gutterBottom>
              Application Details
            </Typography>
            
          </Box>
        </Box>

        {/* Status Card */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              Application Status
            </Typography>
            <Chip
              label={application.status}
              color={getStatusColor(application.status) as any}
              
            />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Application ID</Typography>
              <Typography variant="body1">{application._id}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Submitted</Typography>
              <Typography variant="body1">
                {new Date(application.createdAt).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Last Updated</Typography>
              <Typography variant="body1">
                {new Date(application.updatedAt).toLocaleDateString()}
              </Typography>
            </Grid>
            {application.adminNotes && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Admin Notes</Typography>
                <Typography variant="body1">{application.adminNotes}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>

        <Grid container spacing={4}>
          {/* Company Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Company Information</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Company Name</Typography>
                    <Typography variant="body1">{application.company?.name || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Registration Number</Typography>
                    <Typography variant="body1">{application.company?.registrationNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Country</Typography>
                    <Typography variant="body1">{application.company?.country || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography variant="body1">{application.company?.address || 'N/A'}</Typography>
                  </Grid>
                  {application.company?.taxId && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Tax ID</Typography>
                      <Typography variant="body1">{application.company.taxId}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact & Business Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{application.contact?.email || 'N/A'}</Typography>
                  </Grid>
                  {application.contact?.phone && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{application.contact.phone}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Website</Typography>
                    <Typography variant="body1">{application.contact?.website || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Industry</Typography>
                    <Typography variant="body1">{application.contact?.industry || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Use Case</Typography>
                    <Typography variant="body1">{application.businessPurpose?.useCase || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Target Users</Typography>
                    <Typography variant="body1">{application.businessPurpose?.targetUsers || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* ROI Configuration */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CreditCardIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Card Configuration</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Card Type</Typography>
                    <Typography variant="body1">{application.roiInputs?.cardType || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Calculation Type</Typography>
                    <Typography variant="body1">
                      {application.roiInputs?.calculationType === 'auto' ? 'Automatic' : 'Manual'}
                    </Typography>
                  </Grid>
                  {application.roiInputs?.years && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Planning Period</Typography>
                      <Typography variant="body1">{application.roiInputs.years} years</Typography>
                    </Grid>
                  )}
                  {application.roiInputs?.cards_number && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Expected Cards</Typography>
                      <Typography variant="body1">{application.roiInputs.cards_number.toLocaleString()}</Typography>
                    </Grid>
                  )}
                  {application.roiInputs?.starting_number && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Starting Number</Typography>
                      <Typography variant="body1">{application.roiInputs.starting_number.toLocaleString()}</Typography>
                    </Grid>
                  )}
                  {application.roiInputs?.expected_cards_growth_rate && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Growth Rate</Typography>
                      <Typography variant="body1">{application.roiInputs.expected_cards_growth_rate}%</Typography>
                    </Grid>
                  )}
                  {application.roiInputs?.features && application.roiInputs.features.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Features</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {application.roiInputs.features.map((feature: string, index: number) => (
                          <Chip key={index} label={feature} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* ROI Results */}
          {application.roiResults && (
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">ROI Analysis</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {application.roiResults.years && application.roiResults.years.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Year</TableCell>
                            <TableCell align="right">In-House ROI</TableCell>
                            <TableCell align="right">IaaS ROI</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {application.roiResults.years.map((year: number, index: number) => (
                            <TableRow key={year}>
                              <TableCell>{year}</TableCell>
                              <TableCell align="right">
                                {application.roiResults.roi?.in_house?.[index]?.toFixed(1) || 'N/A'}%
                              </TableCell>
                              <TableCell align="right">
                                {application.roiResults.roi?.iaas?.[index]?.toFixed(1) || 'N/A'}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No ROI data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Compliance */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Compliance Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Sanctions Status</Typography>
                    <Typography variant="body1">
                      {application.compliance?.noSanctions || 'Not specified'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Attempts (if any) */}
          {application.contactAttempts && application.contactAttempts.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact History
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Method</TableCell>
                          <TableCell>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {application.contactAttempts.map((attempt: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              {new Date(attempt.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{attempt.method}</TableCell>
                            <TableCell>{attempt.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </div>
  );
};

export default ApplicationDetailPage;