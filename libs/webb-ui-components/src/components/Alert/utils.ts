export const getClassNamesByType = (type: 'info' | 'success' | 'error') => {
  const color =
    type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue';

  return `text-${color}-70 dark:text-${color}-50 bg-${color}-10 dark:bg-${color}-120 border border-${color}-40 dark:border-${color}-90`;
};

export const getTypographyClassNamesByType = (
  type: 'info' | 'success' | 'error'
) => {
  const color =
    type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue';

  return `text-${color}-70 dark:text-${color}-50`;
};

export const getTitleClassNamesBySize = (size: 'sm' | 'md') => {
  switch (size) {
    case 'sm':
      return 'text-[14px] leading-[21px] tracking-[0.01em] font-semibold';
    default:
      return 'text-[16px] leading-[24px] tracking-[0.01em] font-semibold';
  }
};

export const getDescriptionClassNamesBySize = (size: 'sm' | 'md') => {
  switch (size) {
    case 'sm':
      return 'text-[12px] leading-[21px] tracking-[0.01em] font-normal';
    default:
      return 'text-[14px] leading-[21px] tracking-[0.01em] font-normal';
  }
};
