import React, { useState, useEffect } from 'react';
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
  Chip,
  Alert,
  CircularProgress,
  Dialog
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { iaasAPI } from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import Slider from '@mui/material/Slider';

const validationSchema = yup.object({
  companyName: yup.string().required('Company name is required'),
  industry: yup.string().required('Industry is required'),
  issuingCountry: yup.string().required('Issuing country is required'),
  numberOfCardsIn5Years: yup.number().min(1, 'Must be at least 1').required('Number of cards is required'),
  cardType: yup.string().required('Card type is required'),
  expectedMonthlyVolume: yup.number().min(0, 'Must be 0 or greater').required('Monthly volume is required'),
  timeline: yup.string().required('Timeline is required'),
  ceoFirstName: yup.string().required('CEO first name is required'),
  ceoLastName: yup.string().required('CEO last name is required'),
  ceoIin: yup.string().required('CEO IIN is required'),
  cfoFirstName: yup.string().required('CFO first name is required'),
  cfoLastName: yup.string().required('CFO last name is required'),
  cfoIin: yup.string().required('CFO IIN is required'),
});

const steps = ['Basic Information', 'Card Requirements', 'Timeline & Features', 'ROI Analysis'];

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
  const [roiData, setRoiData] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [flexibleMonths, setFlexibleMonths] = useState(12);

  const formik = useFormik({
    initialValues: {
      companyName: '',
      industry: '',
      issuingCountry: '',
      numberOfCardsIn5Years: 100,
      cardType: 'Virtual',
      expectedMonthlyVolume: 10000,
      timeline: '6 months',
      customTimelineMonths: undefined,
      features: [] as string[],
      ceoFirstName: '',
      ceoLastName: '',
      ceoIin: '',
      cfoFirstName: '',
      cfoLastName: '',
      cfoIin: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        const submitValues = {
          ...values,
          customTimelineMonths: values.timeline === 'Flexible' ? flexibleMonths : undefined,
        };
        const result = await iaasAPI.submitApplication(submitValues);
        setSuccessModalOpen(true);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to submit application');
      } finally {
        setLoading(false);
      }
    },
  });

  const calculateROI = async () => {
    if (formik.values.numberOfCardsIn5Years && formik.values.expectedMonthlyVolume) {
      try {
        const roiPayload = {
          ...formik.values,
          customTimelineMonths: formik.values.timeline === 'Flexible' ? flexibleMonths : undefined,
        };
        const result = await iaasAPI.calculateROI(roiPayload);
        setRoiData(result.roiData);
      } catch (err) {
        console.error('ROI calculation failed:', err);
      }
    }
  };

  useEffect(() => {
    calculateROI();
    // eslint-disable-next-line
  }, [
    formik.values.numberOfCardsIn5Years,
    formik.values.expectedMonthlyVolume,
    formik.values.cardType,
    formik.values.features.join(','), // join to keep array length constant
    formik.values.timeline,
    flexibleMonths
  ]);

  const handleNext = () => {
    // If on Timeline & Features step, calculate ROI and go to ROI step
    if (activeStep === 2) {
      calculateROI();
      setActiveStep((prevStep) => prevStep + 1);
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = formik.values.features;
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    formik.setFieldValue('features', newFeatures);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="companyName"
                label="Company Name"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                error={formik.touched.companyName && Boolean(formik.errors.companyName)}
                helperText={formik.touched.companyName && formik.errors.companyName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Industry</InputLabel>
                <Select
                  name="industry"
                  value={formik.values.industry}
                  onChange={formik.handleChange}
                  error={formik.touched.industry && Boolean(formik.errors.industry)}
                >
                  {industryOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="issuingCountry"
                label="Issuing Country"
                value={formik.values.issuingCountry}
                onChange={formik.handleChange}
                error={formik.touched.issuingCountry && Boolean(formik.errors.issuingCountry)}
                helperText={formik.touched.issuingCountry && formik.errors.issuingCountry}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>CEO</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    {...formik.getFieldProps('ceoFirstName')}
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    {...formik.getFieldProps('ceoLastName')}
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    {...formik.getFieldProps('ceoIin')}
                    label="IIN"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>CFO</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    {...formik.getFieldProps('cfoFirstName')}
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    {...formik.getFieldProps('cfoLastName')}
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    {...formik.getFieldProps('cfoIin')}
                    label="IIN"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                name="numberOfCardsIn5Years"
                label="Number of Cards (5 Years)"
                value={formik.values.numberOfCardsIn5Years}
                onChange={formik.handleChange}
                error={formik.touched.numberOfCardsIn5Years && Boolean(formik.errors.numberOfCardsIn5Years)}
                helperText={formik.touched.numberOfCardsIn5Years && formik.errors.numberOfCardsIn5Years}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Card Type</InputLabel>
                <Select
                  name="cardType"
                  value={formik.values.cardType}
                  onChange={formik.handleChange}
                  error={formik.touched.cardType && Boolean(formik.errors.cardType)}
                >
                  <MenuItem value="Virtual">Virtual</MenuItem>
                  <MenuItem value="Physical">Physical</MenuItem>
                  <MenuItem value="Both">Both</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                name="expectedMonthlyVolume"
                label="Expected Monthly Transaction Volume"
                value={formik.values.expectedMonthlyVolume}
                onChange={formik.handleChange}
                error={formik.touched.expectedMonthlyVolume && Boolean(formik.errors.expectedMonthlyVolume)}
                helperText={formik.touched.expectedMonthlyVolume && formik.errors.expectedMonthlyVolume}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Timeline</InputLabel>
                <Select
                  name="timeline"
                  value={formik.values.timeline}
                  onChange={e => {
                    formik.handleChange(e);
                    if (e.target.value === 'Flexible') {
                      setFlexibleMonths(12); // default
                      formik.setFieldValue('customTimelineMonths', 12);
                    } else {
                      formik.setFieldValue('customTimelineMonths', undefined);
                    }
                  }}
                  error={formik.touched.timeline && Boolean(formik.errors.timeline)}
                >
                  <MenuItem value="Immediate">Immediate</MenuItem>
                  <MenuItem value="3 months">3 months</MenuItem>
                  <MenuItem value="6 months">6 months</MenuItem>
                  <MenuItem value="12 months">12 months</MenuItem>
                  <MenuItem value="Flexible">Flexible</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formik.values.timeline === 'Flexible' && (
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Choose Timeline (months): {flexibleMonths}</Typography>
                <Slider
                  min={1}
                  max={60}
                  value={flexibleMonths}
                  onChange={(_, val) => {
                    setFlexibleMonths(val as number);
                    formik.setFieldValue('customTimelineMonths', val);
                  }}
                  valueLabelDisplay="auto"
                  marks={[{value: 1, label: '1'}, {value: 12, label: '12'}, {value: 24, label: '24'}, {value: 36, label: '36'}, {value: 48, label: '48'}, {value: 60, label: '60'}]}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Additional Features
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['Rewards', 'FX', 'Corporate Controls', 'Analytics', 'API Integration', 'Custom Branding'].map((feature) => (
                  <Chip
                    key={feature}
                    label={feature}
                    onClick={() => handleFeatureToggle(feature)}
                    color={formik.values.features.includes(feature) ? 'primary' : 'default'}
                    variant={formik.values.features.includes(feature) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 3:
        // Debug: log roiData and costsRevenuesTimeline
        console.log('ROI DATA:', roiData);
        if (roiData) console.log('TIMELINE:', roiData.costsRevenuesTimeline);
        return (
          <Box>
            {roiData && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    ROI Analysis
                  </Typography>
                </Grid>
                {/* New: Single Timeline Cost/Revenue/Net Chart (main) */}
                {roiData.costsRevenuesTimeline && roiData.costsRevenuesTimeline.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Projected Cost, Revenue, and Net Value ({
                        formik.values.timeline === 'Flexible'
                          ? `${flexibleMonths} months`
                          : formik.values.timeline
                      })
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={roiData.costsRevenuesTimeline}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="years" tickFormatter={y => `${(y * 12).toFixed(0)} months`} />
                        <YAxis tickFormatter={v => `$${v.toLocaleString()}`}/>
                        <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`]} />
                        <Legend />
                        <Line type="monotone" dataKey="total_cost_iaas" name="Total Cost" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="revenue_iaas" name="Revenue" stroke="#82ca9d" strokeWidth={2} />
                        <Line type="monotone" dataKey="net_iaas" name="Net Value" stroke="#ff7300" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>
                )}
                {/* Summary Cards */}
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {roiData.annualSavings != null ? `$${roiData.annualSavings.toLocaleString()}` : '-'}
                        </Typography>
                        <Typography variant="body2">Annual Savings</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {roiData.costsRevenuesTimeline && roiData.costsRevenuesTimeline.length > 0 && roiData.costsRevenuesTimeline[roiData.costsRevenuesTimeline.length-1].revenue_iaas != null ? `$${roiData.costsRevenuesTimeline[roiData.costsRevenuesTimeline.length-1].revenue_iaas.toLocaleString()}` : '-'}
                        </Typography>
                        <Typography variant="body2">Total Income</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {roiData.threeYearROI != null ? `${roiData.threeYearROI}%` : '-'}
                        </Typography>
                        <Typography variant="body2">
                          {(() => {
                            let months = 12;
                            if (formik.values.timeline === 'Flexible') {
                              months = flexibleMonths;
                            } else {
                              const match = (formik.values.timeline || '').match(/(\d+)/);
                              if (match) months = parseInt(match[1], 10);
                            }
                            const years = months / 12;
                            return `${years % 1 === 0 ? years : years.toFixed(1)}-Year ROI`;
                          })()}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {roiData.estimatedSetupCost != null ? `$${roiData.estimatedSetupCost.toLocaleString()}` : '-'}
                        </Typography>
                        <Typography variant="body2">Setup Cost</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
            {!roiData && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>Loading ROI data...</Typography>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  // Add a helper to get required fields for each step
  const stepFields = [
    [
      'companyName',
      'industry',
      'issuingCountry',
      'ceoFirstName',
      'ceoLastName',
      'ceoIin',
      'cfoFirstName',
      'cfoLastName',
      'cfoIin',
    ],
    [
      'numberOfCardsIn5Years',
      'cardType',
      'expectedMonthlyVolume',
    ],
    [
      'timeline', // features is optional
    ],
    [], // ROI step, no required fields
  ];

  function isStepValid(step: number) {
    const fields = stepFields[step];
    return fields.every(
      (field) =>
        !formik.errors[field as keyof typeof formik.errors] &&
        formik.values[field as keyof typeof formik.values] !== '' &&
        formik.values[field as keyof typeof formik.values] !== undefined &&
        formik.values[field as keyof typeof formik.values] !== null
    );
  }

  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
    if (userId) {
      navigate(`/dashboard/${userId}`);
    } else {
      // fallback: try to get user from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && user._id) {
        navigate(`/dashboard/${user._id}`);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
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
                variant="contained"
                onClick={() => formik.handleSubmit()}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep)}
              >
                {activeStep === 2 ? 'Apply' : 'Next'}
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