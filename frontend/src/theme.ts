// // src/theme.ts
// import { createTheme } from '@mui/material/styles';

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#231F20',
//     },
//     secondary: {
//       main: '#dc004e',
//     },

//     text:{
//       primary: '#231F20',
//       secondary: '#918f8f'
//     }
//   },
//   typography: {
//     fontFamily: 'Arial, Helvetica, sans-serif',
//   },
// });

// export default theme;


// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

const mastercardColors = {
  red: '#EB001B',
  orange: '#FF5F00',
  yellow: '#F79E1B',
  gray: '#6C6C6C',
  lightGray: '#F5F5F5',
  darkGray: '#2C2C2C',
  white: '#FFFFFF'
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#231F20',
      contrastText: mastercardColors.white,
    },
    secondary: {
      main: mastercardColors.red,
      light: mastercardColors.orange
    },
    background: {
      default: mastercardColors.lightGray,
      paper: mastercardColors.white,
    },
    text: {
      primary: mastercardColors.darkGray,
      secondary: mastercardColors.gray
    },
    ...mastercardColors // Spread all colors for direct access
  },
  typography: {
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    // h1: {
    //   fontWeight: 700,
    //   color: mastercardColors.darkGray,
    // },
    // Add other typography variants as needed
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          // textTransform: 'none',
          // fontWeight: 600,
        },
      },
    },
    // Add other component customizations
  }
});

export default theme;