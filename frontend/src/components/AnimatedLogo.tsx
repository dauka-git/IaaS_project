import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const AnimatedLogo = ({ width = 300, height = 'auto', sx = {} }) => {
  return (
    <Box
      component="img"
      src="/MasterCard Logo animation + Glass-effect Card.gif" // Path from public folder
      alt="MasterCard animated logo with glass effect"
      sx={{
        width: width,
        height: height,
        ...sx  // Allows custom styling from parent
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