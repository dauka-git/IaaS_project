import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

import { TypingTextProps } from '../interfaces';


function TypingText({
  words = ["Hello", "World", "Typing", "Effect"],
  typingSpeed = 150,
  deleteSpeed = 100,
  delayBetweenWords = 1000,
}: TypingTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    const word = words[currentWordIndex];

    if (isDeleting) {
      if (currentText === "") {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        return;
      }

      const timer = setTimeout(() => {
        setCurrentText(word.substring(0, currentText.length - 1));
      }, deleteSpeed);
      return () => clearTimeout(timer);
    }

    if (currentText === word) {
      const timer = setTimeout(() => {
        setIsDeleting(true);
      }, delayBetweenWords);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCurrentText(word.substring(0, currentText.length + 1));
    }, typingSpeed);
    return () => clearTimeout(timer);
  }, [
    currentText,
    currentWordIndex,
    isDeleting,
    words,
    typingSpeed,
    deleteSpeed,
    delayBetweenWords,
  ]);

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
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontFamily: "monospace",
          color: "text.primary",
          display: "flex",
          alignItems: "center",
        }}
      >
        {currentText}
        <motion.span animate={controls}>|</motion.span>
      </Typography>
    </Box>
  );
}

export default function TypingAnimatedText() {
  return <TypingText />;
}