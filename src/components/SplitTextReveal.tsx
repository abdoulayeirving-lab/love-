import React from "react";
import { motion } from "motion/react";

interface SplitTextRevealProps {
  text: string;
  className?: string;
  italicText?: string;
}

export default function SplitTextReveal({ text, className = "", italicText }: SplitTextRevealProps) {
  // Split words or characters
  const characters = text.split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.h2
      className={`${className} flex flex-wrap justify-center md:justify-start items-center gap-x-1`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className="inline-block"
          style={{ display: "inline-block", minWidth: char === " " ? "0.45em" : "auto" }}
        >
          {char}
        </motion.span>
      ))}

      {italicText && (
        <motion.span
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
          className="font-serif italic bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent font-normal inline-block ml-1"
        >
          {italicText}
        </motion.span>
      )}
    </motion.h2>
  );
}
