import isPrimitive from '@webb-tools/dapp-types/utils/isPrimitive';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import {
  type ComponentProps,
  type ComponentType,
  forwardRef,
  type ReactNode,
  type SVGAttributes,
} from 'react';
import { twMerge } from 'tailwind-merge';

type HowItWorksProps = ComponentProps<'div'> & {
  docsUrl?: string;
};

const HowItWorks = forwardRef<HTMLDivElement, HowItWorksProps>(
  ({ children, className, docsUrl, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge(
          'space-y-6 p-6 rounded-xl bg-linear-table max-w-lg',
          className,
        )}
        ref={ref}
      >
        <Typography variant="body1" fw="bold">
          How it works
        </Typography>

        <div>{children}</div>

        {docsUrl && (
          <Button
            variant="link"
            size="sm"
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View docs
          </Button>
        )}
      </div>
    );
  },
);

HowItWorks.displayName = 'HowItWorks';

type HowItWorksStepProps = ComponentProps<'div'> & {
  Icon: ComponentType<Omit<SVGAttributes<SVGElement>, 'children'>>;
  title: ReactNode;
  description: ReactNode;
};

const HowItWorksStep = forwardRef<HTMLDivElement, HowItWorksStepProps>(
  ({ Icon, title, description, className, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge('flex gap-4 items-start', className)}
        ref={ref}
      >
        <Icon width={24} height={24} />

        <div className="pb-7 space-y-0.5">
          {isPrimitive(title) ? (
            <Typography variant="body2" fw="semibold">
              {title}
            </Typography>
          ) : (
            title
          )}

          {isPrimitive(description) ? (
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-100"
            >
              {description}
            </Typography>
          ) : (
            description
          )}
        </div>
      </div>
    );
  },
);

HowItWorksStep.displayName = 'HowItWorksStep';

export type { HowItWorksProps, HowItWorksStepProps };

export { HowItWorks, HowItWorksStep };
