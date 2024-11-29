import React from 'react';
import { twMerge } from 'tailwind-merge';

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={twMerge(
        'p-3 rounded-xl transition-colors',
        'bg-mono-0 dark:bg-mono-160',
        'hover:bg-mono-20 dark:hover:bg-mono-140',
        'border border-mono-40 dark:border-mono-140',
        className,
      )}
    >
      {icon}
    </button>
  );
};
