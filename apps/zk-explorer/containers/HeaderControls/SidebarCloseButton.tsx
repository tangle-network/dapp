import { Close } from '@webb-tools/icons';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type SidebarCloseButtonProps = PropsOf<'div'> & {
  /**
   * Whether the button takes up the full width of
   * its container, and aligns its content (the close icon)
   * to the right.
   *
   * This is useful when the button is used in the sidebar,
   * but its positioning does not need to be precisely controlled.
   */
  isRightAligned?: boolean;

  setSidebarOpen: (isOpen: boolean) => void;
};

/**
 * A handy, re-usable button to close the sidebar.
 *
 * This is not required for the sidebar to work.
 */
const SidebarCloseButton: FC<SidebarCloseButtonProps> = ({
  isRightAligned,
  setSidebarOpen,
  className,
  ...rest
}) => {
  const isRightmostClass = isRightAligned
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

export default SidebarCloseButton;
