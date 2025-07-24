"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

const SpotlightCard = () => {
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
        bgcolor: "#111", // darker background for better effect
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
          sx={{ fontWeight: "semibold", color: '#1976d2' }} // blue
        >
          Byline
        </Typography>
        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h2" sx={{ fontWeight: "bold", color: "white" }}>
            Hero
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{ mt: 6, color: '#888' }} // grey
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit, facilis illum
          eum ullam nostrum atque quam.
        </Typography>
      </Box>
    </Box>
  );
};

export default function MuiSpotlightDemo() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        p: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SpotlightCard />
    </Box>
  );
}