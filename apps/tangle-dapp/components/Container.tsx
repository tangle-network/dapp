import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export type ContainerProps = PropsWithChildren<{
  className?: string;
}>;

const Container: FC<ContainerProps> = ({ children, className }) => {
  return (
    <div
      className={twMerge(
        'bg-mono-0 dark:bg-mono-200 p-6 rounded-xl border border-mono-60 dark:border-mono-170',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Container;
