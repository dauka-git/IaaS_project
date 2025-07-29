
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Stack,
  Divider
} from '@mui/material';
import {
  Calculate,
  TrendingUp,
  AttachMoney,
  DateRange,
  Add,
  Remove,
  AutoGraph,
  EditCalendar
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

interface ROIResults {
  years: number[];
  incomes: number[];
  costs: {
    in_house: number[];
    iaas: number[];
  };
  net: {
    in_house: number[];
    iaas: number[];
  };
  roi: {
    in_house: number[];
    iaas: number[];
  };
}

interface ROICalculatorProps {
  onCalculate?: (results: ROIResults, inputs: any) => void;
}

type CalculationType = 'auto' | 'manual';

type AutoFormData = {
  years: number;
  cards_number: number;
  cardType: string;
  features: string[];
  starting_number: number;
  expected_cards_growth_rate: number;
};

type ManualFormData = {
  cardType: string;
  features: string[];
  explicit_cards_number: { [year: number]: number };
};

const ROICalculator: React.FC<ROICalculatorProps> = ({ onCalculate }) => {
  const [calculationType, setCalculationType] = useState<CalculationType>('auto');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ROIResults | null>(null);
  const [error, setError] = useState('');

  // Auto ROI form data
  const [autoFormData, setAutoFormData] = useState<AutoFormData>({
    years: 3,
    cards_number: 50000,
    cardType: 'Virtual',
    features: [],
    starting_number: 5000,
    expected_cards_growth_rate: 1.5
  });

  // Manual ROI form data
  const [manualFormData, setManualFormData] = useState<ManualFormData>({
    cardType: 'Virtual',
    features: [],
    explicit_cards_number: {
      1: 10000,
      2: 25000,
      3: 50000
    }
  });

  const cardTypes = ['Virtual', 'Physical', 'Both'];
  const availableFeatures = ['Rewards', 'FX', 'Corporate Controls', 'Analytics', 'API Integration', 'Custom Branding'];

  const handleAutoInputChange = (field: keyof AutoFormData, value: any) => {
    setAutoFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleManualInputChange = (field: keyof ManualFormData, value: any) => {
    setManualFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleManualCardsChange = (year: number, value: string) => {
    setManualFormData(prev => ({
      ...prev,
      explicit_cards_number: {
        ...prev.explicit_cards_number,
        [year]: parseInt(value) || 0
      }
    }));
  };

  const addManualYear = () => {
    const years = Object.keys(manualFormData.explicit_cards_number).map(Number);
    const nextYear = Math.max(...years) + 1;
    handleManualCardsChange(nextYear, '0');
  };

  const removeManualYear = (year: number) => {
    const newCardsNumber = { ...manualFormData.explicit_cards_number };
    delete newCardsNumber[year];
    setManualFormData(prev => ({
      ...prev,
      explicit_cards_number: newCardsNumber
    }));
  };

  const toggleFeature = (feature: string, isAuto: boolean = true) => {
    const setFormData = isAuto ? setAutoFormData : setManualFormData;
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f: string) => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const calculateROI = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const endpoint = calculationType === 'auto'
        ? '/api/roi/auto'
        : '/api/roi/manual';

      const payload = calculationType === 'auto' ? autoFormData : manualFormData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate ROI');
      }

      setResults(data.roiData);
      if (onCalculate) {
        onCalculate(data.roiData, payload);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = () => {
    if (!results) return [];
    return results.years.map((year: number, index: number) => ({
      year: `Year ${year}`,
      income: results.incomes[index],
      inHouseCost: results.costs.in_house[index],
      iaasCost: results.costs.iaas[index],
      inHouseNet: results.net.in_house[index],
      iaasNet: results.net.iaas[index],
      inHouseROI: results.roi.in_house[index],
      iaasROI: results.roi.iaas[index]
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', gap: 4 }}>
      {/* Left side - Forms */}
      <Box sx={{ flex: 1 }}>
        <Card 
          elevation={8}
          sx={{ 
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Calculation Type Selector */}
            <Box >
              
              <ToggleButtonGroup
                value={calculationType}
                exclusive
                onChange={(e, value) => value && setCalculationType(value as CalculationType)}
                fullWidth
                sx={{ mb: 3 }}
              >
                <ToggleButton 
                  value="auto"
                  sx={{
                    py: 2,
                    flexDirection: 'column',
                    '&.Mui-selected': {
                      bgcolor: mastercardColors.red,
                      color: 'white',
                      '&:hover': {
                        bgcolor: mastercardColors.red,
                      }
                    }
                  }}
                >
                  <AutoGraph sx={{ mb: 1 }} />
                  <Typography variant="h6">Automatic Growth Model</Typography>
                  
                </ToggleButton>
                <ToggleButton 
                  value="manual"
                  sx={{
                    py: 2,
                    flexDirection: 'column',
                    '&.Mui-selected': {
                      bgcolor: mastercardColors.orange,
                      color: 'white',
                      '&:hover': {
                        bgcolor: mastercardColors.orange,
                      }
                    }
                  }}
                >
                  <EditCalendar sx={{ mb: 1 }} />
                  <Typography variant="h6">Manual Year-by-Year</Typography>
                  
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Auto ROI Form */}
            {calculationType === 'auto' && (
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Projection Years"
                    type="number"
                    value={autoFormData.years}
                    onChange={(e) => handleAutoInputChange('years', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 10 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: mastercardColors.red,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: mastercardColors.red,
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Total Cards Target"
                    type="number"
                    value={autoFormData.cards_number}
                    onChange={(e) => handleAutoInputChange('cards_number', parseInt(e.target.value))}
                    inputProps={{ min: 1000 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: mastercardColors.red,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: mastercardColors.red,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Starting Cards"
                    type="number"
                    value={autoFormData.starting_number}
                    onChange={(e) => handleAutoInputChange('starting_number', parseInt(e.target.value))}
                    inputProps={{ min: 100 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: mastercardColors.red,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: mastercardColors.red,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Growth Rate"
                    type="number"
                    value={autoFormData.expected_cards_growth_rate}
                    onChange={(e) => handleAutoInputChange('expected_cards_growth_rate', parseFloat(e.target.value))}
                    inputProps={{ min: 1, max: 5, step: 0.1 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: mastercardColors.red,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: mastercardColors.red,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{ 
                        '&.Mui-focused': { 
                          color: mastercardColors.red 
                        } 
                      }}
                    >
                      Card Type
                    </InputLabel>
                    <Select
                      value={autoFormData.cardType}
                      label="Card Type"
                      onChange={(e) => handleAutoInputChange('cardType', e.target.value as string)}
                      sx={{
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: mastercardColors.red,
                        },
                      }}
                    >
                      {cardTypes.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {/* Manual ROI Form */}
            {calculationType === 'manual' && (
              <Box mb={4}>
                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel
                        sx={{ 
                          '&.Mui-focused': { 
                            color: mastercardColors.orange 
                          } 
                        }}
                      >
                        Card Type
                      </InputLabel>
                      <Select
                        value={manualFormData.cardType}
                        label="Card Type"
                        onChange={(e) => handleManualInputChange('cardType', e.target.value as string)}
                        sx={{
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: mastercardColors.orange,
                          },
                        }}
                      >
                        {cardTypes.map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" sx={{ color: mastercardColors.darkGray }}>
                      Cards per Year
                    </Typography>
                    <Button
                      onClick={addManualYear}
                      startIcon={<Add />}
                      variant="contained"
                      sx={{
                        bgcolor: mastercardColors.orange,
                        '&:hover': {
                          bgcolor: mastercardColors.red,
                        },
                      }}
                    >
                      Add Year
                    </Button>
                  </Stack>
                  
                  <Grid container spacing={2}>
                    {Object.entries(manualFormData.explicit_cards_number)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([year, cards]) => (
                      <Grid item xs={12} key={year}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body1" sx={{ minWidth: 60, color: mastercardColors.gray }}>
                            Year {year}:
                          </Typography>
                          <TextField
                            size="small"
                            type="number"
                            value={cards}
                            onChange={(e) => handleManualCardsChange(year, e.target.value)}
                            inputProps={{ min: 0 }}
                            sx={{
                              flex: 1,
                              '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                  borderColor: mastercardColors.orange,
                                },
                              },
                            }}
                          />
                          {Object.keys(manualFormData.explicit_cards_number).length > 1 && (
                            <IconButton
                              onClick={() => removeManualYear(year)}
                              size="small"
                              sx={{ color: mastercardColors.red }}
                            >
                              <Remove />
                            </IconButton>
                          )}
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            )}

            {/* Features Selection */}
            <Box mb={4}>
              <Typography variant="h6" gutterBottom sx={{ color: mastercardColors.darkGray }}>
                Additional Features
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {availableFeatures.map(feature => {
                  const currentFeatures = calculationType === 'auto' ? autoFormData.features : manualFormData.features;
                  const isSelected = currentFeatures.includes(feature);
                  
                  return (
                    <Chip
                      key={feature}
                      label={feature}
                      onClick={() => toggleFeature(feature, calculationType === 'auto')}
                      variant={isSelected ? "filled" : "outlined"}
                      sx={{
                        bgcolor: isSelected ? mastercardColors.yellow : 'transparent',
                        color: isSelected ? mastercardColors.darkGray : mastercardColors.gray,
                        borderColor: mastercardColors.yellow,
                        '&:hover': {
                          bgcolor: isSelected ? mastercardColors.orange : mastercardColors.lightGray,
                        },
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>

            {/* Calculate Button */}
            <Box textAlign="center">
              <Button
                onClick={calculateROI}
                disabled={loading}
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Calculate />}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  background: `linear-gradient(45deg, ${mastercardColors.red}, ${mastercardColors.orange})`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${mastercardColors.orange}, ${mastercardColors.red})`,
                  },
                  '&:disabled': {
                    background: mastercardColors.gray,
                  },
                }}
              >
                {loading ? 'Calculating...' : 'Calculate ROI'}
              </Button>
            </Box>

            {/* Error Display */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 4,
                  '& .MuiAlert-icon': {
                    color: mastercardColors.red,
                  },
                }}
              >
                <strong>Error:</strong> {error}
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Right side - Results */}
      <Box sx={{ flex: 1 }}>
        {results ? (
          <Box>
            {/* Summary Cards */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={4}>
                <Card 
                  elevation={6}
                  sx={{ 
                    background: `linear-gradient(135deg, ${mastercardColors.red}, ${mastercardColors.orange})`,
                    color: 'white',
                    borderRadius: 3
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <AttachMoney sx={{ fontSize: 32 }} />
                      <Box>
                        <Typography variant="subtitle2">Total Savings (IaaS)</Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {formatCurrency(results.net.iaas.reduce((sum, val) => sum + val, 0)).replace('$', '')}
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
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <TrendingUp sx={{ fontSize: 32 }} />
                      <Box>
                        <Typography variant="subtitle2">Average ROI (IaaS)</Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {(results.roi.iaas.reduce((sum, val) => sum + val, 0) / results.roi.iaas.length).toFixed(1)}%
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
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <DateRange sx={{ fontSize: 32 }} />
                      <Box>
                        <Typography variant="subtitle2">Projection Period</Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {results.years.length} Years
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} mb={3}>
              {/* Cost Comparison Chart */}
              <Grid item xs={12}>
                <Card elevation={6} sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: mastercardColors.darkGray }}>
                      Cost Comparison
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={formatChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke={mastercardColors.lightGray} />
                        <XAxis dataKey="year" stroke={mastercardColors.gray} />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} 
                          stroke={mastercardColors.gray}
                        />
                        <Tooltip 
                          formatter={(value) => typeof value === 'number' ? formatCurrency(value) : value}
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
              <Grid item xs={12}>
                <Card elevation={6} sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: mastercardColors.darkGray }}>
                      Net Income Comparison
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formatChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke={mastercardColors.lightGray} />
                        <XAxis dataKey="year" stroke={mastercardColors.gray} />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                          stroke={mastercardColors.gray}
                        />
                        <Tooltip 
                          formatter={(value) => typeof value === 'number' ? formatCurrency(value) : value}
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
            <Card elevation={6} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: mastercardColors.darkGray }}>
                  Detailed Breakdown
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
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
          </Box>
        ) : (
          <Card elevation={6} sx={{ borderRadius: 3, height: 'fit-content' }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Calculate sx={{ fontSize: 64, color: mastercardColors.gray, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                See results here
              </Typography>
              
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default ROICalculator;