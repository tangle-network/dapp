import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export type ContainerProps = PropsWithChildren<{
  className?: string;
}>;

const Container: FC<ContainerProps> = ({ children, className }) => {
  return (
    <div
      className={twMerge(
        'p-6 rounded-xl',
        'bg-mono-0 dark:bg-mono-200',
        'border border-mono-60 dark:border-mono-170',
        'shadow-webb-lg dark:shadow-webb-lg-dark',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Container;
