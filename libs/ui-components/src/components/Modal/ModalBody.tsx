import { FC, ReactNode } from 'react';
import useIsBreakpoint from '../../hooks/useIsBreakpoint';
import { twMerge } from 'tailwind-merge';

export type ModalBodyProps = {
  children: ReactNode;
  className?: string;
};

export const ModalBody: FC<ModalBodyProps> = ({ children, className }) => {
  const isMobile = useIsBreakpoint('md', true);

  return (
    <div
      className={twMerge(
        'flex flex-col items-stretch justify-center gap-5 p-9',
        'max-h-[calc(100vh-66px-8rem)] overflow-y-scroll',
        isMobile && 'max-h-[calc(100vh-66px-8rem)] overflow-y-scroll',
        className,
      )}
    >
      {children}
    </div>
  );
};
