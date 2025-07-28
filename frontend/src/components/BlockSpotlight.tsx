

"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

interface SpotlightCardProps {
  byline?: string;
  mainText: string;
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
        p: 8,
        boxShadow: 24,
        overflow: "hidden",
        '&:hover .spotlight-overlay': {
          opacity: 1,
        },
      }}
    >
      {/* Spotlight Overlay */}
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

      {/* Content */}
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "semibold", color: bylineColor }}
        >
          {byline}
        </Typography>
        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h2" sx={{ fontWeight: "bold", color: mainTextColor }}>
            {mainText}
          </Typography>
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