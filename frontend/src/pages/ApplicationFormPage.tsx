import { useState, useEffect } from 'react';
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
import * as Yup from 'yup';
import { iaasAPI } from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import Slider from '@mui/material/Slider';
import { ROIData, ROIrequest } from '../interfaces';

const validationSchema = Yup.object({
   company: Yup.object({
    name: Yup.string().required('Company name is required'),
    registrationNumber: Yup.string().required('Registration number (BIN) is required'),
    country: Yup.string().required('Country of incorporation is required'),
    address: Yup.string().required('Registered address is required'),
  }),

  representative: Yup.object({}),

  contact: Yup.object({
    email: Yup.string()
      .email('Invalid business email format')
      .required('Business email is required'),
    phone: Yup.string().required('Phone number is required'),
    website: Yup.string()
      .url('Invalid URL')
      .required('Website is required'),
    industry: Yup.string()
      .oneOf(['Bank', 'Fintech', 'Telecom', 'Retail', 'eCommerce', 'Other'])
      .required('Industry is required'),
  }),

  businessPurpose: Yup.object({
    useCase: Yup.string()
      .oneOf(['Salary Cards', 'Loyalty Program', 'Virtual Cards', 'BNPL', 'Other'])
      .required('Use case is required'),
    targetUsers: Yup.string()
      .oneOf(['B2C', 'B2B', 'Internal Use', 'Mixed'])
      .required('Target audience is required'),
    expectedVolume: Yup.number()
      .typeError('Expected volume must be a number')
      .min(1, 'Must be at least 1 card')
      .required('Expected card volume is required'),
    
  }),


  compliance: Yup.object({
    noSanctions: Yup.string()
      .oneOf(['Confirmed', 'Not Confirmed'], 'This confirmation is required')
      .required('This confirmation is required'),
    consent: Yup.string()
      .oneOf(['Consented', 'Not Consented'], 'Consent is required')
      .required('Consent is required'),
  }),

  volume: Yup.object({
    cards_number: Yup.number().min(10000, 'Must be at least 10000').required('Number of cards is required'),
    cardType: Yup.string().required('Card type is required'),
    expectedMonthlyVolume: Yup.number().min(0, 'Must be 0 or greater').required('Monthly volume is required'),
    timeline: Yup.string().required('Timeline is required'),
  }),
  
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
  const [roiLoading, setRoiLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [flexibleMonths, setFlexibleMonths] = useState(24);

  const formik = useFormik({
    initialValues: {
      company: {
        name: '',
        registrationNumber: '',
        country: '',
        address: '',
        taxId: ''
      },
      representative: {},
      contact: {
        email: '',
        website: '',
        industry: ''
      },
      businessPurpose: {
        useCase: '',
        targetUsers: '',
        expectedVolume: ''
      },
      compliance: {
        noSanctions: '',
        consent: ''
      },
      volume: {
        cards_number: 10000,
        cardType: '',
        expectedMonthlyVolume: 0,
        timeline: ''
      },
      features: [] // <-- add features to initialValues
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        // Use correct API method for submission
        await iaasAPI.submitApplication(values);
        setSuccessModalOpen(true);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to submit application');
      } finally {
        setLoading(false);
      }
    },
  });

  function prepareROIRequest(
    formikValues: typeof formik.values,
  ): ROIrequest {

    let years;
    if (formik.values.volume.timeline === 'Flexible') {
      years = Math.floor(flexibleMonths / 12);
    } else {
      years = 5;
    }
    
    return {
      cards_number: formikValues.volume.cards_number,
      years: years,
      cardType: formikValues.volume.cardType,
      features: formikValues.features
    };
  }

  const calculateROI = async () => {
    setRoiLoading(true);
    setError("");
    setRoiData(null);

    const roiRequest = prepareROIRequest(formik.values);

    
    if (formik.values.volume.cards_number >0) {
      try {
        const result = await iaasAPI.calculateROI({ roiRequest });
        // Adapt FastAPI ROI result to recharts format
        const roi = result.roiData;
        // Build costsRevenuesTimeline for recharts
        const costsRevenuesTimeline = roi.years.map((year, idx) => ({
          year,
          income: roi.incomes[idx],
          total_cost_inhouse: roi.costs.in_house[idx],
          total_cost_iaas: roi.costs.iaas[idx],
          net_inhouse: roi.net.in_house[idx],
          net_iaas: roi.net.iaas[idx],
          roi_inhouse: roi.roi.in_house[idx],
          roi_iaas: roi.roi.iaas[idx],
        }));
        setRoiData({ ...roi, costsRevenuesTimeline });
      } catch (err) {
        setError('Failed to calculate ROI');
        setRoiData(null);
      } finally {
        setRoiLoading(false);
      }
    } else {
      setRoiLoading(false);
    }
  };

  // Only trigger ROI calculation when entering ROI Analysis step
  useEffect(() => {
    if (activeStep === 3) {
      calculateROI();
    }
    // eslint-disable-next-line
  }, [activeStep]);

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
    const currentFeatures: string[] = formik.values.features || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter((f: string) => f !== feature)
      : [...currentFeatures, feature];
    formik.setFieldValue('features', newFeatures);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
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
            <Grid item xs={12} md={6}>
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
              <TextField
                fullWidth
                type="number"
                name="businessPurpose.expectedVolume"
                label="Expected Card Volume"
                value={formik.values.businessPurpose.expectedVolume}
                onChange={formik.handleChange}
                error={formik.touched.businessPurpose?.expectedVolume && Boolean(formik.errors.businessPurpose?.expectedVolume)}
                helperText={formik.touched.businessPurpose?.expectedVolume && formik.errors.businessPurpose?.expectedVolume}
              />
            </Grid>
            {/* Compliance Section */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Sanctions Confirmation</InputLabel>
                <Select
                  name="compliance.noSanctions"
                  value={formik.values.compliance.noSanctions}
                  onChange={formik.handleChange}
                  error={formik.touched.compliance?.noSanctions && Boolean(formik.errors.compliance?.noSanctions)}
                >
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="Not Confirmed">Not Confirmed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Consent</InputLabel>
                <Select
                  name="compliance.consent"
                  value={formik.values.compliance.consent}
                  onChange={formik.handleChange}
                  error={formik.touched.compliance?.consent && Boolean(formik.errors.compliance?.consent)}
                >
                  <MenuItem value="Consented">Consented</MenuItem>
                  <MenuItem value="Not Consented">Not Consented</MenuItem>
                </Select>
              </FormControl>
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
                name="volume.cards_number"
                label="Number of Cards"
                value={formik.values.volume.cards_number}
                onChange={formik.handleChange}
                error={formik.touched.volume?.cards_number && Boolean(formik.errors.volume?.cards_number)}
                helperText={formik.touched.volume?.cards_number && formik.errors.volume?.cards_number}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Card Type</InputLabel>
                <Select
                  name="volume.cardType"
                  value={formik.values.volume.cardType}
                  onChange={formik.handleChange}
                  error={formik.touched.volume?.cardType && Boolean(formik.errors.volume?.cardType)}
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
                name="volume.expectedMonthlyVolume"
                label="Expected Monthly Transaction Volume"
                value={formik.values.volume.expectedMonthlyVolume}
                onChange={formik.handleChange}
                error={formik.touched.volume?.expectedMonthlyVolume && Boolean(formik.errors.volume?.expectedMonthlyVolume)}
                helperText={formik.touched.volume?.expectedMonthlyVolume && formik.errors.volume?.expectedMonthlyVolume}
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
                  name="volume.timeline"
                  value={formik.values.volume.timeline}
                  onChange={e => {
                    formik.handleChange(e);
                    if (e.target.value === 'Flexible') {
                      setFlexibleMonths(12); // default
                      formik.setFieldValue('customTimelineMonths', 12);
                    } else {
                      formik.setFieldValue('customTimelineMonths', undefined);
                    }
                  }}
                  error={formik.touched.volume?.timeline && Boolean(formik.errors.volume?.timeline)}
                >
                  <MenuItem value="Immediate">Immediate</MenuItem>
                  <MenuItem value="3 months">3 months</MenuItem>
                  <MenuItem value="6 months">6 months</MenuItem>
                  <MenuItem value="12 months">12 months</MenuItem>
                  <MenuItem value="Flexible">Flexible</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formik.values.volume.timeline === 'Flexible' && (
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Choose Timeline (months): {flexibleMonths}</Typography>
                <Slider
                  min={1}
                  max={120}
                  value={flexibleMonths}
                  onChange={(_, val) => {
                    setFlexibleMonths(val as number);
                    formik.setFieldValue('customTimelineMonths', val);
                  }}
                  valueLabelDisplay="auto"
                  marks={[
                     {value: 24, label: '24'},  {value: 48, label: '48'}, {value: 72, label: '72'}, 
                     {value: 96, label: '96'},  {value: 120, label: '120'}
                    ]}
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
                        formik.values.volume.timeline === 'Flexible'
                          ? `${flexibleMonths} months`
                          : formik.values.volume.timeline
                      })
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={roiData.costsRevenuesTimeline}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tickFormatter={y => `Year ${y}`} />
                        <YAxis tickFormatter={v => `$${v.toLocaleString()}`}/>
                        <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`]} />
                        <Legend />
                        <Line type="monotone" dataKey="income" name="Income" stroke="#82ca9d" strokeWidth={2} />
                        <Line type="monotone" dataKey="total_cost_iaas" name="IaaS Cost" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="total_cost_inhouse" name="In-House Cost" stroke="#ffb347" strokeWidth={2} />
                        <Line type="monotone" dataKey="net_iaas" name="IaaS Net" stroke="#ff7300" strokeWidth={2} />
                        <Line type="monotone" dataKey="net_inhouse" name="In-House Net" stroke="#008000" strokeWidth={2} />
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
                            if (formik.values.volume.timeline === 'Flexible') {
                              months = flexibleMonths;
                            } else {
                              const match = (formik.values.volume.timeline || '').match(/(\d+)/);
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
  function isStepValid(step: number) {
    // This function is not used for validation, but if needed, update to check nested fields
    return true;
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
                disabled={loading || roiLoading || !roiData}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Submitting...' : roiLoading ? 'Calculating ROI...' : 'Submit Application'}
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