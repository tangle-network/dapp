import pluralize from '@tangle-network/ui-components/utils/pluralize';

export const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60)
    return `${diffInSeconds} ${pluralize('second', diffInSeconds > 1)} ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60)
    return `${diffInMinutes} ${pluralize('minute', diffInMinutes > 1)} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} ${pluralize('hour', diffInHours > 1)} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30)
    return `${diffInDays} ${pluralize('day', diffInDays > 1)} ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12)
    return `${diffInMonths} ${pluralize('month', diffInMonths > 1)} ago`;

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${pluralize('year', diffInYears > 1)} ago`;
};
