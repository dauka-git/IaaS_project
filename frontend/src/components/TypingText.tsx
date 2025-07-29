

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

interface TypingTextProps {
  words?: string[];
  typingSpeed?: number;
  deleteSpeed?: number;
  delayBetweenWords?: number;
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2" | "body1" | "body2";
  color?: string;
  fontFamily?: string;
  sx?: object;
  fixedHeight?: string;
}

function TypingText({
  words = ["Default", "Text"],
  typingSpeed = 150,
  deleteSpeed = 100,
  delayBetweenWords = 1000,
  variant = "h4",
  color = "text.primary",
  fontFamily = "monospace"
}: TypingTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    const word = words[currentWordIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      if (currentText === "") {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        return;
      }

      timer = setTimeout(() => {
        setCurrentText(word.substring(0, currentText.length - 1));
      }, deleteSpeed);
    } else if (currentText === word) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, delayBetweenWords);
    } else {
      timer = setTimeout(() => {
        setCurrentText(word.substring(0, currentText.length + 1));
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [currentText, currentWordIndex, isDeleting, words, typingSpeed, deleteSpeed, delayBetweenWords]);

  useEffect(() => {
    controls.start({
      opacity: [0.2, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
      },
    });
  }, [controls]);

  return (
    <Typography
      variant={variant}
      sx={{
        fontFamily,
        color,
        display: "flex",
        alignItems: "center",
        minHeight: "1.5em" 
      }}
    >
      {currentText}
      <motion.span 
        animate={controls}
        style={{ marginLeft: 4 }}
      >
        |
      </motion.span>
    </Typography>
  );
}

interface TypingAnimatedTextProps extends TypingTextProps {
  containerSx?: object;
  sx?: object; 

}

export default function TypingAnimatedText({ 
  fixedHeight = '4rem',
  words = ["Mastercard", "Innovation", "Technology"],
  containerSx = {},
  sx ={},
  ...props 
}: TypingAnimatedTextProps) {
  return (
    <Box
      sx={{
        height: fixedHeight,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        ...containerSx
      }}
    >
      <TypingText words={words} {...props}
        sx={{
          // width: "100%",
          display: "flex",
          alignItems: "center",
          // justifyContent: "center",
          ...sx
        }}
      />
    </Box>
  );
}