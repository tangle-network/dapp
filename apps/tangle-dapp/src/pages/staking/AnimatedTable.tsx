import cx from 'classnames';
import { AnimatePresence, HTMLMotionProps, motion } from 'framer-motion';
import type { FC, PropsWithChildren } from 'react';

type Props = PropsWithChildren<
  {
    isTableOpen?: boolean;
  } & HTMLMotionProps<'div'>
>;

export const AnimatedTable: FC<Props> = ({
  children,
  isTableOpen,
  className,
  ...props
}) => {
  return (
    <AnimatePresence>
      {isTableOpen && (
        <motion.div
          key="undelegate-request-table"
          className={cx('max-w-lg origin-[0_0_0]', className)}
          transition={{ duration: 0.15 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
