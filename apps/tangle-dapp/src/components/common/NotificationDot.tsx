import { StatusIndicator } from '@webb-tools/icons';
import { ComponentProps, FC } from 'react';

interface NotificationDotProps {
  variant?: ComponentProps<typeof StatusIndicator>['variant'];
  size?: number;
  className?: string;
}

export const NotificationDot: FC<NotificationDotProps> = ({
  variant = 'success',
  size = 12,
  className,
}) => <StatusIndicator variant={variant} size={size} className={className} />;
