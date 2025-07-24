// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#231F20',
    },
    secondary: {
      main: '#dc004e',
    },

    text:{
      primary: '#231F20',
      secondary: '#918f8f'
    }
  },
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
});

export default theme;