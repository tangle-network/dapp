import { ChevronDown } from '@webb-tools/icons';
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SelectCardProps {
  label: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const SelectCard: React.FC<SelectCardProps> = ({
  label,
  icon,
  title,
  subtitle,
  onClick,
  disabled,
  className,
}) => {
  return (
    <div className="space-y-1">
      <span className="block text-sm font-medium text-mono-140 dark:text-mono-80">
        {label}
      </span>
      <button
        onClick={onClick}
        disabled={disabled}
        className={twMerge(
          'w-full p-3 rounded-xl transition-colors text-left',
          'bg-mono-20 dark:bg-mono-160 hover:bg-mono-40 dark:hover:bg-mono-140',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        )}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-mono-200 dark:text-mono-0 truncate">
              {title}
            </div>
          </div>
          <ChevronDown className="text-mono-120 w-4 h-4" />
        </div>
      </button>
    </div>
  );
};
