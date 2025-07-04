// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
      actions: '#EB001B'
    },
    secondary: {
      main: '#dc004e',
      headlines: '#1A1A1A',
      text: '#4D4D4D'
    },
  },
  typography: {
    fontFamily: 'Helvetica Neue, sans-serif',
  },
});

export default theme;