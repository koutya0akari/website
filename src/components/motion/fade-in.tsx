'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
};

export function FadeIn({ children, className, delay = 0, direction = 'up' }: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const directionOffset = {
    up: 40,
    down: -40,
    left: 40,
    right: -40,
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: direction === 'up' || direction === 'down' ? directionOffset[direction] : 0, x: direction === 'left' || direction === 'right' ? directionOffset[direction] : 0 }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: direction === 'up' || direction === 'down' ? directionOffset[direction] : 0, x: direction === 'left' || direction === 'right' ? directionOffset[direction] : 0 }}
      transition={{ duration: 0.7, delay: delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInStagger({ children, className, faster = false }: { children: React.ReactNode; className?: string, faster?: boolean }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ staggerChildren: faster ? 0.1 : 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
