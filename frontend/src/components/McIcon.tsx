// src/components/MastercardIcon.jsx
import { Box } from '@mui/material';

const MastercardIcon = ({ width = 24, height = 24 }) => (
  <Box
    component="img"
    src="./icons/ma_symbol.svg"
    alt="Mastercard"
    sx={{ 
      width: width,
      height: height,
      
    }}
  />
);

export default MastercardIcon;