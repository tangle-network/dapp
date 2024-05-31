import { type FC, type PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export const SectionWrapper: FC<PropsWithChildren & { className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div
      className={twMerge(
        'p-4 rounded-lg bg-[rgba(247,248,247,0.80)] dark:bg-mono-170',
        'flex flex-col gap-2',
        className,
      )}
    >
      {children}
    </div>
  );
};

export const NoteOrAmountWrapper: FC<
  PropsWithChildren & { className?: string }
> = ({ children, className }) => {
  return (
    <div
      className={twMerge(
        'px-3 py-2 rounded-lg bg-[rgba(226,229,235,0.30)] dark:bg-mono-160',
        className,
      )}
    >
      {children}
    </div>
  );
};
