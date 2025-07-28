
import { useState } from 'react';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Avatar, 
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  DateRange,
  Calculate,
  Margin
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { iaasAPI } from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import ROICalculator from '../components/ROIcalculator';
import Navbar from '../components/Navbar'

// Mastercard color palette
const mastercardColors = {
  red: '#EB001B',
  orange: '#FF5F00',
  yellow: '#F79E1B',
  gray: '#6C6C6C',
  lightGray: '#F5F5F5',
  darkGray: '#2C2C2C',
  white: '#FFFFFF'
};

const validationSchema = Yup.object({
  company: Yup.object({
    name: Yup.string().required('Company name is required'),
    registrationNumber: Yup.string().required('Registration number (BIN) is required'),
    country: Yup.string().required('Country of incorporation is required'),
    address: Yup.string().required('Registered address is required'),
  }),

  contact: Yup.object({
    email: Yup.string()
      .email('Invalid business email format')
      .required('Business email is required'),
    website: Yup.string()
      .required('Website is required'),
    industry: Yup.string()
      .oneOf(['Banking', 'Fintech', 'Telecom', 'Retail', 'E-commerce', 'HR', 'Other'])
      .required('Industry is required'),
  }),

  businessPurpose: Yup.object({
    useCase: Yup.string()
      .oneOf(['Salary Cards', 'Loyalty Program', 'Virtual Cards', 'BNPL', 'Other'])
      .required('Use case is required'),
    targetUsers: Yup.string()
      .oneOf(['B2C', 'B2B', 'Internal Use', 'Mixed'])
      .required('Target audience is required'),
  }),
  compliance: Yup.object({
    noSanctions: Yup.string()
      .oneOf(['Sanctioned', 'Not sanctioned'])
      .required('Sanctions status is required'),
  }),
});

const steps = ['Basic Information', 'ROI Analysis', 'Confirmation'];

const industryOptions = [
  'Fintech',
  'E-commerce',
  'Banking',
  'Telecom',
  'HR',
  'Other',
];

export default function ApplicationFormPage() {
  const { userId } = useParams();
  if (!userId) {
    return <Alert severity="error">Invalid access. Please log in and try again.</Alert>;
  }
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [roiData, setRoiData] = useState<any>(null);
  const [roiInputs, setRoiInputs] = useState<any>(null);
  // const [consented, setConsented] = useState(true);


  const formik = useFormik({
    initialValues: {
      company: {
        name: '',
        registrationNumber: '',
        country: '',
        address: '',
        taxId: ''
      },
      // representative: {},
      contact: {
        email: '',
        website: '',
        industry: ''
      },
      businessPurpose: {
        useCase: '',
        targetUsers: '',
        // expectedVolume: ''
      },
      compliance: {
        noSanctions: ''
      },
      
      features: []
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log('Form submission started');
      setLoading(true);
      setError('');
      try {
        // Combine all data including ROI results
        
        const applicationData = {
          ...values,
          // ROI inputs with proper structure
          roiInputs: {
            calculationType: roiInputs?.calculationType || 'auto',
            cardType: roiInputs?.cardType || 'Virtual',
            features: roiInputs?.features || [],
            // Auto ROI fields (only if auto type)
            ...(roiInputs?.calculationType === 'auto' && {
              years: roiInputs.years,
              cards_number: roiInputs.cards_number,
              starting_number: roiInputs.starting_number,
              expected_cards_growth_rate: roiInputs.expected_cards_growth_rate
            }),
            // Manual ROI fields (only if manual type)
            ...(roiInputs?.calculationType === 'manual' && {
              explicit_cards_number: roiInputs.explicit_cards_number
            })
          },
          // ROI calculation results
          roiResults: roiData ? {
            years: roiData.years,
            incomes: roiData.incomes,
            costs: roiData.costs,
            net: roiData.net,
            roi: roiData.roi
          } : null
        };

        console.log('Complete submission data:', applicationData); // Add this

        
        const response = await iaasAPI.submitApplication(applicationData);

        console.log('API response:', response); // Add this

        setSuccessModalOpen(true);


      } catch (err: any) {
        setSuccessModalOpen(true);
        setError(err.response?.data?.message || 'Failed to submit application');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleRoiData = (data: any, inputs: any) => {
    console.log('ROI data received:', data);
    console.log('ROI inputs received:', inputs);
    setRoiData(data);
    setRoiInputs(inputs);
  };

   const handleSubmit = async () => {
    console.log('Submit button clicked - handleSubmit called');
    
    // Check if we have ROI data
    if (!roiData) {
      setError('Please complete the ROI analysis before submitting');
      return;
    }

    // Trigger formik validation and submission
    const errors = await formik.validateForm();
    formik.setTouched({
      company: {
        name: true,
        registrationNumber: true,
        country: true,
        address: true,
      },
      contact: {
        email: true,
        website: true,
        industry: true,
      },
      businessPurpose: {
        useCase: true,
        targetUsers: true,
      },
      compliance: {
        noSanctions: true,
      },
    });

    if (Object.keys(errors).length === 0) {
      console.log('No validation errors, submitting...');
      formik.submitForm();
    } else {
      console.log('Validation errors:', errors);
      setError('Please fill in all required fields in the Basic Information step');
    }
  };

  const formatChartData = () => {
    if (!roiData) return [];
    
    return roiData.years.map((year, index) => ({
      year: `Year ${year}`,
      income: roiData.incomes[index],
      inHouseCost: roiData.costs.in_house[index],
      iaasCost: roiData.costs.iaas[index],
      inHouseNet: roiData.net.in_house[index],
      iaasNet: roiData.net.iaas[index],
      inHouseROI: roiData.roi.in_house[index],
      iaasROI: roiData.roi.iaas[index]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Basic Information
        return (
          <div>
          <Navbar/>

          <Grid container spacing={3}>
            {/* Company Section */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="company.name"
                label="Company Name"
                value={formik.values.company.name}
                onChange={formik.handleChange}
                error={formik.touched.company?.name && Boolean(formik.errors.company?.name)}
                helperText={formik.touched.company?.name && formik.errors.company?.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="company.registrationNumber"
                label="Registration Number (BIN)"
                value={formik.values.company.registrationNumber}
                onChange={formik.handleChange}
                error={formik.touched.company?.registrationNumber && Boolean(formik.errors.company?.registrationNumber)}
                helperText={formik.touched.company?.registrationNumber && formik.errors.company?.registrationNumber}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="company.country"
                label="Country of Incorporation"
                value={formik.values.company.country}
                onChange={formik.handleChange}
                error={formik.touched.company?.country && Boolean(formik.errors.company?.country)}
                helperText={formik.touched.company?.country && formik.errors.company?.country}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="company.address"
                label="Registered Address"
                value={formik.values.company.address}
                onChange={formik.handleChange}
                error={formik.touched.company?.address && Boolean(formik.errors.company?.address)}
                helperText={formik.touched.company?.address && formik.errors.company?.address}
              />
            </Grid>
            {/* Contact Section */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="contact.email"
                label="Business Email"
                value={formik.values.contact.email}
                onChange={formik.handleChange}
                error={formik.touched.contact?.email && Boolean(formik.errors.contact?.email)}
                helperText={formik.touched.contact?.email && formik.errors.contact?.email}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="contact.website"
                label="Website"
                value={formik.values.contact.website}
                onChange={formik.handleChange}
                error={formik.touched.contact?.website && Boolean(formik.errors.contact?.website)}
                helperText={formik.touched.contact?.website && formik.errors.contact?.website}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  name="contact.industry"
                  value={formik.values.contact.industry}
                  onChange={formik.handleChange}
                  error={formik.touched.contact?.industry && Boolean(formik.errors.contact?.industry)}
                >
                  {industryOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Business Purpose Section */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Use Case</InputLabel>
                <Select
                  name="businessPurpose.useCase"
                  value={formik.values.businessPurpose.useCase}
                  onChange={formik.handleChange}
                  error={formik.touched.businessPurpose?.useCase && Boolean(formik.errors.businessPurpose?.useCase)}
                >
                  <MenuItem value="Salary Cards">Salary Cards</MenuItem>
                  <MenuItem value="Loyalty Program">Loyalty Program</MenuItem>
                  <MenuItem value="Virtual Cards">Virtual Cards</MenuItem>
                  <MenuItem value="BNPL">BNPL</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  name="businessPurpose.targetUsers"
                  value={formik.values.businessPurpose.targetUsers}
                  onChange={formik.handleChange}
                  error={formik.touched.businessPurpose?.targetUsers && Boolean(formik.errors.businessPurpose?.targetUsers)}
                >
                  <MenuItem value="B2C">B2C</MenuItem>
                  <MenuItem value="B2B">B2B</MenuItem>
                  <MenuItem value="Internal Use">Internal Use</MenuItem>
                  <MenuItem value="Mixed">Mixed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Sanctions</InputLabel>
                <Select
                  name="compliance.noSanctions"
                  value={formik.values.compliance.noSanctions}
                  onChange={formik.handleChange}
                  error={formik.touched.compliance?.noSanctions && Boolean(formik.errors.compliance?.noSanctions)}
                >
                  <MenuItem value="Sanctioned">Sanctioned</MenuItem>
                  <MenuItem value="Not sanctioned">Not sanctioned</MenuItem>
                  
                </Select>
              </FormControl>
            </Grid>

           
          </Grid>
          {/* <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              mt: 3
            }}
          >
           <Box  sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              border : '1px solid #ccc',
              borderRadius:2,
              m:3, 
              p:2,
              maxWidth: '600px', // Add this line
              width: '100%' 
              }}>
              <Typography variant="body1" sx={{ fontWeight: 500, pb:2 }}>
                Confirm your permission to process personal information:
              </Typography>

              <Button
              onClick={ () =>{
                const newValue = !consented
                setConsented(newValue)
                
              }}
              variant={consented ? "contained" : "outlined"}
              color={consented ? "primary" : "secondary"}
             
              sx={consented ? {
                      ml: 2,
                      background: `linear-gradient(45deg, ${mastercardColors.red}, ${mastercardColors.orange})`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${mastercardColors.orange}, ${mastercardColors.red})`,
                      },
                      '&:disabled': {
                        background: mastercardColors.gray,
                      }
                    } : { ml: 2 }}
              >
                    {consented ? 'I Agree' : 'I Disagree'}

            </Button>
          </Box>
          </Box> */}
          </div>
        );
      

      case 1: // ROI Analysis
        return (
          <div>
            <Box sx={{mb:4}}>
              <Navbar />
            </Box>
            

          <Box>
            <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
              Calculate Your ROI
            </Typography>
            <ROICalculator onCalculate={handleRoiData} />
          </Box>
          </div>
        );

      case 2: // Confirmation
        return (
          <Box>
            
            <Navbar/>
            
            {roiData ? (
              <Box sx={{ mt: 4 }}>
                {/* Summary Cards */}
                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} md={4}>
                    <Card 
                      elevation={6}
                      sx={{ 
                        background: `linear-gradient(135deg, ${mastercardColors.red}, ${mastercardColors.orange})`,
                        color: 'white',
                        borderRadius: 3
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <AttachMoney sx={{ fontSize: 40 }} />
                          <Box>
                            <Typography variant="h6">Total Savings (IaaS)</Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {formatCurrency(roiData.net.iaas.reduce((sum, val) => sum + val, 0)).replace('$', '')}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card 
                      elevation={6}
                      sx={{ 
                        background: `linear-gradient(135deg, ${mastercardColors.orange}, ${mastercardColors.yellow})`,
                        color: 'white',
                        borderRadius: 3
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <TrendingUp sx={{ fontSize: 40 }} />
                          <Box>
                            <Typography variant="h6">Average ROI (IaaS)</Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {(roiData.roi.iaas.reduce((sum, val) => sum + val, 0) / roiData.roi.iaas.length).toFixed(1)}%
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card 
                      elevation={6}
                      sx={{ 
                        background: `linear-gradient(135deg, ${mastercardColors.gray}, ${mastercardColors.darkGray})`,
                        color: 'white',
                        borderRadius: 3
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <DateRange sx={{ fontSize: 40 }} />
                          <Box>
                            <Typography variant="h6">Projection Period</Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {roiData.years.length} Years
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={4} mb={4}>
                  {/* Cost Comparison Chart */}
                  <Grid item xs={12} lg={6}>
                    <Card elevation={6} sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: mastercardColors.darkGray }}>
                          Cost Comparison
                        </Typography>
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart data={formatChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke={mastercardColors.lightGray} />
                            <XAxis dataKey="year" stroke={mastercardColors.gray} />
                            <YAxis 
                              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} 
                              stroke={mastercardColors.gray}
                            />
                            <Tooltip 
                              formatter={(value) => formatCurrency(value)}
                              contentStyle={{
                                backgroundColor: mastercardColors.white,
                                border: `2px solid ${mastercardColors.lightGray}`,
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="inHouseCost" fill={mastercardColors.red} name="In-House Cost" />
                            <Bar dataKey="iaasCost" fill={mastercardColors.orange} name="IaaS Cost" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Net Income Chart */}
                  <Grid item xs={12} lg={6}>
                    <Card elevation={6} sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: mastercardColors.darkGray }}>
                          Net Income Comparison
                        </Typography>
                        <ResponsiveContainer width="100%" height={350}>
                          <LineChart data={formatChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke={mastercardColors.lightGray} />
                            <XAxis dataKey="year" stroke={mastercardColors.gray} />
                            <YAxis 
                              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                              stroke={mastercardColors.gray}
                            />
                            <Tooltip 
                              formatter={(value) => formatCurrency(value)}
                              contentStyle={{
                                backgroundColor: mastercardColors.white,
                                border: `2px solid ${mastercardColors.lightGray}`,
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="inHouseNet" 
                              stroke={mastercardColors.red} 
                              strokeWidth={4} 
                              name="In-House Net" 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="iaasNet" 
                              stroke={mastercardColors.orange} 
                              strokeWidth={4} 
                              name="IaaS Net" 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Detailed Table */}
                <Card elevation={6} sx={{ borderRadius: 3, mb: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: mastercardColors.darkGray }}>
                      Detailed ROI Breakdown
                    </Typography>
                    <TableContainer component={Paper} elevation={0}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: mastercardColors.lightGray }}>
                            <TableCell sx={{ fontWeight: 'bold', color: mastercardColors.darkGray }}>Year</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: mastercardColors.darkGray }}>Income</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: mastercardColors.darkGray }}>In-House Cost</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: mastercardColors.darkGray }}>IaaS Cost</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: mastercardColors.darkGray }}>IaaS Net</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: mastercardColors.darkGray }}>IaaS ROI</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formatChartData().map((row, index) => (
                            <TableRow 
                              key={index}
                              sx={{ 
                                '&:nth-of-type(odd)': { 
                                  bgcolor: mastercardColors.lightGray + '40' 
                                },
                                '&:hover': {
                                  bgcolor: mastercardColors.yellow + '20'
                                }
                              }}
                            >
                              <TableCell sx={{ fontWeight: 'bold' }}>{row.year}</TableCell>
                              <TableCell>{formatCurrency(row.income)}</TableCell>
                              <TableCell sx={{ color: mastercardColors.red }}>
                                {formatCurrency(row.inHouseCost)}
                              </TableCell>
                              <TableCell sx={{ color: mastercardColors.orange }}>
                                {formatCurrency(row.iaasCost)}
                              </TableCell>
                              <TableCell sx={{ color: mastercardColors.orange, fontWeight: 'bold' }}>
                                {formatCurrency(row.iaasNet)}
                              </TableCell>
                              <TableCell sx={{ color: mastercardColors.red, fontWeight: 'bold' }}>
                                {row.iaasROI.toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
                
                <Typography variant="body1" sx={{ textAlign: 'center', mb: 3 }}>
                  Review your ROI analysis above. When ready, click "Submit Application" to finalize your submission.
                </Typography>
              </Box>
            ) : (
              <Card elevation={6} sx={{ borderRadius: 3, py: 8, textAlign: 'center' }}>
                <CardContent>
                  <Calculate sx={{ fontSize: 64, color: mastercardColors.gray, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No ROI Analysis Found
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Please complete the ROI analysis in the previous step before submitting your application.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={handleBack}
                    sx={{ 
                      borderColor: mastercardColors.red, 
                      color: mastercardColors.red,
                      '&:hover': {
                        borderColor: mastercardColors.orange,
                        bgcolor: mastercardColors.lightGray
                      }
                    }}
                  >
                    Go Back to ROI Analysis
                  </Button>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
    navigate(userId ? `/dashboard/${userId}` : '/');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, mt:4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Mastercard IaaS Application
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2, mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              sx={{ ml: 2 }}
              color="secondary"
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </Box>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                type='submit'
                variant="contained"
                onClick={
                 handleSubmit
                }
                disabled={loading || !roiData}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{
                  background: `linear-gradient(45deg, ${mastercardColors.red}, ${mastercardColors.orange})`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${mastercardColors.orange}, ${mastercardColors.red})`,
                  },
                  '&:disabled': {
                    background: mastercardColors.gray,
                  },
                }}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 1 && !roiData}
                sx={{
                  background: `linear-gradient(45deg, ${mastercardColors.red}, ${mastercardColors.orange})`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${mastercardColors.orange}, ${mastercardColors.red})`,
                  },
                  '&:disabled': {
                    background: mastercardColors.gray,
                  },
                }}
              >
                {activeStep === 1 ? 'Continue to Confirmation' : 'Next'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      <Dialog open={successModalOpen} onClose={handleSuccessModalClose}>
        <Box p={3} textAlign="center">
          <Typography variant="h6" gutterBottom>Application submitted successfully!</Typography>
          <Button variant="contained" onClick={handleSuccessModalClose}>OK</Button>
        </Box>
      </Dialog>
    </Container>
  );
}