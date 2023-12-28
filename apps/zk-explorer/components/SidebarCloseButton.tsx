import { Close } from '@webb-tools/icons';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type SidebarCloseButtonProps = PropsOf<'div'> & {
  isRightmost?: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
};

/**
 * A handy, re-usable button to close the sidebar.
 *
 * This is not required for the sidebar to work.
 */
export const SidebarCloseButton: FC<SidebarCloseButtonProps> = ({
  isRightmost,
  setSidebarOpen,
  className,
  ...rest
}) => {
  const isRightmostClass = isRightmost
    ? 'flex items-center justify-end w-full'
    : '';

  return (
    <div {...rest} className={twMerge(isRightmostClass, className)}>
      <Close
        size="lg"
        className="cursor-pointer"
        onClick={() => setSidebarOpen(false)}
      />
    </div>
  );
};
