import { Typography } from '@webb-tools/webb-ui-components';
import { twMerge } from 'tailwind-merge';

interface InfoCardProps {
  serviceId: string;
  className?: string;
}

async function InfoCard({ serviceId, className }: InfoCardProps) {
  return (
    <div
      className={twMerge(
        'p-5 space-y-4 rounded-2xl',
        'bg-glass dark:bg-glass_dark',
        'border border-mono-0 dark:border-mono-160',
        className
      )}
    >
      <Typography variant="h4" fw="bold">
        Service Details
      </Typography>
      <div className="space-y-3"></div>
    </div>
  );
}

export default InfoCard;
