/**
 * Get Tailwind CSS classes for asset label colors based on the label color type.
 */
export const getAssetLabelColorClasses = (
  labelColor: 'green' | 'purple' | 'blue' | 'red' | 'yellow',
): string => {
  switch (labelColor) {
    case 'green':
      return 'bg-green-100 text-mono-0 dark:bg-green-900 dark:text-mono-0';
    case 'purple':
      return 'bg-purple-900 text-mono-0 dark:bg-purple-900 dark:text-mono-0';
    case 'blue':
      return 'bg-blue-900 text-mono-0 dark:bg-blue-900 dark:text-mono-0';
    case 'red':
      return 'bg-red-900 text-mono-0 dark:bg-red-900 dark:text-mono-0';
    case 'yellow':
      return 'bg-yellow-900 text-mono-0 dark:bg-yellow-900 dark:text-mono-0';
    default:
      return 'bg-blue-900 text-mono-0 dark:bg-blue-900 dark:text-mono-0';
  }
};

export default getAssetLabelColorClasses;
