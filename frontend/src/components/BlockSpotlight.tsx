
"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import TypingAnimatedText from "./TypingText";

interface SpotlightCardProps {
  byline?: string;
  mainText: string | string[];
  secondaryText: string;
  bylineColor?: string;
  mainTextColor?: string;
  secondaryTextColor?: string;
}



const SpotlightCard = ({
  byline,
  mainText,
  secondaryText,
  bylineColor = "#1976d2",
  mainTextColor = "white",
  secondaryTextColor = "#888",
}: SpotlightCardProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const background = useMotionTemplate`
    radial-gradient(650px circle at ${mouseX}px ${mouseY}px, 
    rgba(14, 165, 233, 0.15), 
    transparent 80%)
  `;

  return (
    <Box
      component="div"
      onMouseMove={handleMouseMove}
      sx={{
        position: "relative",
        maxWidth: "md",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "#111",
        p: 3,
        pt:8,
        pb:8,
        boxShadow: 24,
        width: 600,
        height: 400,
        overflow: "hidden",
        '&:hover .spotlight-overlay': {
          opacity: 1,
        },
      }}
    >
      <Box
        component={motion.div}
        className="spotlight-overlay"
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: 4,
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.3s",
          zIndex: 1,
        }}
        style={{ background }}
      />

      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "semibold", color: bylineColor }}
        >
          {byline}
        </Typography>
        <Box sx={{  display: "flex", alignItems: "center", gap: 1 }}>
          

           {typeof mainText === 'string' ? (
              <Typography 
                sx={{ 
                  fontWeight: "bold", 
                  color: mainTextColor,
                  fontSize: {
                    xs: 14,    
                    sm: 14,   
                    md: 14,   
                    lg: 16,    
                    xl: 16    
                  },
                  
                  lineHeight: 1.2
                }}
              >
                {mainText}
              </Typography>
            ) : (
              <TypingAnimatedText 
                words={mainText}
                variant="h4"
                color={mainTextColor}
                containerSx={{ 
                  justifyContent: 'flex-start',
                  width: 'auto',
                  height: '100%'
                }}
                sx={{
                   
                   display: 'flex',
                   alignItems: 'center',
                  fontWeight: "bold",
                  fontSize: {
                    xs: 14,
                    sm: 14,
                    md: 14,
                    lg: 16,
                    xl: 16
                  },
                  lineHeight: 1.2
                }}
              />
            )}
        </Box>
        <Typography
          variant="body1"
          sx={{ mt: 6, color: secondaryTextColor }}
        >
          {secondaryText}
        </Typography>
      </Box>
    </Box>
  );
};

export default SpotlightCard