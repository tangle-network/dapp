import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

export type AnimatedTableProps = PropsWithChildren & {
  isTableOpen?: boolean;
  isMediumScreen?: boolean;
};

export function AnimatedTable({
  children,
  isMediumScreen,
  isTableOpen,
}: AnimatedTableProps) {
  return (
    <AnimatePresence>
      {(!isMediumScreen || isTableOpen) && (
        <motion.div
          key="unstake-request-table"
          className={cx('max-w-lg origin-[0_0_0]')}
          transition={{ duration: 0.15 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
