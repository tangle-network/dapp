import { HTMLMotionProps, motion } from 'framer-motion';
import { FC } from 'react';

const SlideAnimation: FC<HTMLMotionProps<'div'>> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.25 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default SlideAnimation;
