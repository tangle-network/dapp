import { AlertProps } from './types.js';

export const getClassNamesByType = (type: AlertProps['type']) => {
  switch (type) {
    case 'success':
      return `text-green-70 dark:text-green-50 bg-green-10 dark:bg-green-120 border border-green-40 dark:border-green-90`;
    case 'error':
      return `text-red-70 dark:text-red-50 bg-red-10 dark:bg-red-120 border border-red-40 dark:border-red-90`;
    case 'warning':
      return `text-yellow-70 dark:text-yellow-50 bg-yellow-10 dark:bg-yellow-120 border border-yellow-40 dark:border-yellow-90`;
    default:
      return `text-blue-70 dark:text-blue-50 bg-blue-10 dark:bg-blue-120 border border-blue-40 dark:border-blue-90`;
  }
};

export const getTypographyClassNamesByType = (type: AlertProps['type']) => {
  switch (type) {
    case 'success':
      return `text-green-70 dark:text-green-50`;
    case 'error':
      return `text-red-70 dark:text-red-50`;
    case 'warning':
      return `text-yellow-70 dark:text-yellow-50`;
    default:
      return `text-blue-70 dark:text-blue-50`;
  }
};

export const getTitleClassNamesBySize = (size: AlertProps['size']) => {
  switch (size) {
    case 'sm':
      return 'text-[14px] leading-[21px] tracking-[0.01em] font-semibold';
    default:
      return 'text-[16px] leading-[24px] tracking-[0.01em] font-semibold';
  }
};

export const getDescriptionClassNamesBySize = (size: AlertProps['size']) => {
  switch (size) {
    case 'sm':
      return 'text-[12px] leading-[21px] tracking-[0.01em] font-normal';
    default:
      return 'text-[14px] leading-[21px] tracking-[0.01em] font-normal';
  }
};

export const getIconClassNamesByType = (type: AlertProps['type']) => {
  switch (type) {
    case 'success':
      return `text-green-70 dark:text-green-50`;
    case 'error':
      return `text-red-70 dark:text-red-50`;
    case 'warning':
      return `text-yellow-70 dark:text-yellow-50`;
    default:
      return `text-blue-70 dark:text-blue-50`;
  }
};
