import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import type { FC, PropsWithChildren } from 'react';

type Props = PropsWithChildren & {
  isTableOpen?: boolean;
  isMediumScreen?: boolean;
};

export const AnimatedTable: FC<Props> = ({
  children,
  isMediumScreen,
  isTableOpen,
}) => {
  return (
    <AnimatePresence>
      {(!isMediumScreen || isTableOpen) && (
        <motion.div
          key="undelegate-request-table"
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
};
