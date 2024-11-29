import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  disabled,
  loading,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={twMerge(
        'w-full p-4 rounded-xl transition-all',
        'text-lg font-semibold',
        'bg-mono-60 dark:bg-mono-120 text-mono-100 dark:text-mono-80 cursor-not-allowed',
        loading && 'opacity-80',
        className,
      )}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <span className="animate-spin">⟳</span>
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
