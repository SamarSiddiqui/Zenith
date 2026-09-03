"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li';
}

/** Reveals content once as it scrolls into view. Honors prefers-reduced-motion. */
export function Reveal({ children, delay = 0, className, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    if (as === 'section') return <section className={className}>{children}</section>;
    if (as === 'li') return <li className={className}>{children}</li>;
    return <div className={className}>{children}</div>;
  }

  const Component = as === 'section' ? motion.section : as === 'li' ? motion.li : motion.div;

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.28, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </Component>
  );
}
