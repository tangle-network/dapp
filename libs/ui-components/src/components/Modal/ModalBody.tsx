import { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type ModalBodyProps = {
  children: ReactNode;
  className?: string;
};

export const ModalBody: FC<ModalBodyProps> = ({ children, className }) => {
  return (
    <div
      className={twMerge(
        'flex flex-col items-stretch justify-center gap-5 p-9',
        className,
      )}
    >
      {children}
    </div>
  );
};
