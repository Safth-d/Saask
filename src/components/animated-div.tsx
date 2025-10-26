"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface AnimatedDivProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  animation?: "fadeIn" | "slideInFromLeft" | "slideInFromRight";
}

const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  },
  slideInFromLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 },
  },
  slideInFromRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 },
  },
};

export function AnimatedDiv({
  children,
  className,
  animation = "fadeIn",
  ...props
}: AnimatedDivProps) {
  return (
    <motion.div
      className={className}
      initial={animations[animation].initial}
      animate={animations[animation].animate}
      transition={animations[animation].transition}
      {...props}
    >
      {children}
    </motion.div>
  );
}
