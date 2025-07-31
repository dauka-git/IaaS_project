import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const AnimatedLogo = ({ width = 300, height = 'auto', sx = {} }) => {
  return (
    <Box
      component="img"
      
      src ="/mastercard-logo.gif"
      
      alt="MasterCard animated logo with glass effect"
      sx={{
        width: width,
        height: height,
        ...sx  
      }}
    />
  );
};

AnimatedLogo.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sx: PropTypes.object
};

export default AnimatedLogo;