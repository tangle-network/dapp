'use client';

import { HTMLMotionProps, motion } from 'framer-motion';
import { forwardRef, PropsWithChildren } from 'react';

export type AnimatedPageWrapperProps = HTMLMotionProps<'div'>;

const AnimatedPageWrapper = forwardRef<
  HTMLDivElement,
  PropsWithChildren<AnimatedPageWrapperProps>
>(({ children, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      style={{ transformOrigin: 'left' }}
      initial={{ opacity: 0, flex: 'none', width: '0%' }}
      animate={{ opacity: 1, flex: '1 1 0%', width: '100%' }}
      transition={{ duration: 0.3, delay: 0.3 }}
      exit={{ opacity: 0, flex: 'none', width: '0%' }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

AnimatedPageWrapper.displayName = 'AnimatedPageWrapper';

export default AnimatedPageWrapper;
