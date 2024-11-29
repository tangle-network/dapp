import { StatusIndicator } from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ComponentProps, FC } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

// Consider extracting common props to a base interface
interface BaseActionProps {
  label: string;
  isDisabled?: boolean;
  className?: string;
}

// Separate notification-specific props
interface NotificationProps {
  hasNotificationDot?: boolean;
  notificationDotVariant?: ComponentProps<typeof StatusIndicator>['variant'];
}

// Main component props extending base props
interface ActionItemProps extends BaseActionProps, NotificationProps {
  Icon: (props: IconBase) => ReactElement;
  onClick?: () => void;
  to?: string; // Changed from internalHref for React Router
  tooltip?: ReactElement | string;
}

// Extract styles to a constant for reusability
const ACTION_ITEM_STYLES = {
  container: 'inline-flex flex-col justify-center items-center gap-2',
  iconWrapper: [
    'inline-flex mx-auto items-center justify-center relative p-2 rounded-lg',
    'hover:bg-mono-60 dark:hover:bg-mono-160',
    'text-mono-200 dark:text-mono-0',
  ],
  disabled: 'opacity-50 !cursor-not-allowed',
  enabled: 'cursor-pointer',
  label: 'block text-center dark:text-mono-0',
} as const;

const ActionItem: FC<ActionItemProps> = ({
  Icon,
  label,
  onClick,
  to,
  tooltip,
  isDisabled = false,
  hasNotificationDot = false,
  notificationDotVariant = 'success',
  className,
}) => {
  // Extract content to a separate component for better organization
  const ActionContent = () => (
    <div
      className={twMerge(
        ACTION_ITEM_STYLES.container,
        isDisabled && ACTION_ITEM_STYLES.disabled,
        className,
      )}
    >
      <div
        onClick={isDisabled ? undefined : onClick}
        className={twMerge(
          ...ACTION_ITEM_STYLES.iconWrapper,
          isDisabled ? ACTION_ITEM_STYLES.disabled : ACTION_ITEM_STYLES.enabled,
        )}
      >
        {hasNotificationDot && (
          <StatusIndicator
            variant={notificationDotVariant}
            size={12}
            className="absolute top-0 right-0"
          />
        )}
        <Icon size="lg" />
      </div>

      <Typography
        component="span"
        variant="body1"
        className={ACTION_ITEM_STYLES.label}
      >
        {label}
      </Typography>
    </div>
  );

  // Wrap content with Link if 'to' prop is provided
  const ContentWithLink = to ? (
    <Link to={to}>
      <ActionContent />
    </Link>
  ) : (
    <ActionContent />
  );

  // Wrap with Tooltip if tooltip prop is provided
  return tooltip ? (
    <Tooltip>
      <TooltipBody className="break-normal max-w-[250px] text-center">
        {tooltip}
      </TooltipBody>
      <TooltipTrigger asChild>{ContentWithLink}</TooltipTrigger>
    </Tooltip>
  ) : (
    ContentWithLink
  );
};

export default ActionItem;
