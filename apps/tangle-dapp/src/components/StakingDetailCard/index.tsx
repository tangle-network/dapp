import { isPrimitive } from '@tangle-network/dapp-types';
import { ExternalLinkLine } from '@tangle-network/icons/ExternalLinkLine';
import { TitleWithInfo } from '@tangle-network/ui-components/components/TitleWithInfo';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import {
  type ComponentProps,
  ForwardedRef,
  forwardRef,
  type JSXElementConstructor,
  type ReactElement,
  type ReactNode,
} from 'react';
import { twMerge } from 'tailwind-merge';

type ElementBase = string | JSXElementConstructor<any>;

type StakingDetailCardRootProps = ComponentProps<'div'>;

const StakingDetailCardRoot = forwardRef<
  HTMLDivElement,
  StakingDetailCardRootProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      {...props}
      className={twMerge(
        'px-4 py-6 rounded-2xl bg-linear-table space-y-4 md:min-w-[600px]',
        className,
      )}
      ref={ref}
    >
      {children}
    </div>
  );
});

StakingDetailCardRoot.displayName = 'StakingDetailCardRoot';

type StakingDetailCardHeaderProps<
  IconProps,
  RightElementProps,
  IconElement extends ElementBase = ElementBase,
  RightElement extends ElementBase = ElementBase,
> = ComponentProps<'div'> & {
  IconElement?: ReactElement<IconProps, IconElement>;
  title?: ReactNode;
  description?: ReactNode;
  descExternalLink?: string;
  RightElement?: ReactElement<RightElementProps, RightElement>;
};

const StakingDetailCardHeader = forwardRef(
  <
    IconProps,
    RightElementProps,
    IconEl extends ElementBase = ElementBase,
    RightEl extends ElementBase = ElementBase,
  >(
    {
      className,
      title,
      description,
      descExternalLink,
      RightElement,
      IconElement,
      ...props
    }: StakingDetailCardHeaderProps<
      IconProps,
      RightElementProps,
      IconEl,
      RightEl
    >,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <div
        {...props}
        className={twMerge('flex items-start justify-between', className)}
        ref={ref}
      >
        <div className="flex items-center gap-4">
          {IconElement}

          <div>
            {isPrimitive(title) && title !== null && title !== undefined ? (
              <Typography
                variant="h5"
                fw="bold"
                className="text-mono-200 dark:text-mono-0"
              >
                {title}
              </Typography>
            ) : (
              title
            )}

            <div className="flex items-center gap-0.5 text-mono-120 dark:text-mono-100">
              {isPrimitive(description) &&
              description !== null &&
              description !== undefined ? (
                <Typography
                  variant="body3"
                  className="text-mono-120 dark:text-mono-100"
                >
                  {description}
                </Typography>
              ) : (
                description
              )}

              {descExternalLink && (
                <a
                  href={descExternalLink}
                  target="_blank"
                  rel="noreferrer"
                  className="!text-inherit"
                >
                  <ExternalLinkLine className="!fill-current" />
                </a>
              )}
            </div>
          </div>
        </div>

        {RightElement}
      </div>
    );
  },
);

StakingDetailCardHeader.displayName = 'StakingDetailCardHeader';

type StakingDetailCardBodyProps = ComponentProps<'div'>;

const StakingDetailCardBody = forwardRef<
  HTMLDivElement,
  StakingDetailCardBodyProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      {...props}
      className={twMerge('flex items-center', className)}
      ref={ref}
    >
      {children}
    </div>
  );
});

StakingDetailCardBody.displayName = 'StakingDetailCardBody';

type StakingDetailCardItemProps = ComponentProps<'div'> & {
  title: string;
  tooltip?: ReactNode;
};

const StakingDetailCardItem = forwardRef<
  HTMLDivElement,
  StakingDetailCardItemProps
>(({ className, title, tooltip, children, ...props }, ref) => {
  return (
    <div {...props} className={twMerge('space-y-1 grow', className)} ref={ref}>
      {isPrimitive(children) ? (
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          {children}
        </Typography>
      ) : (
        children
      )}

      <TitleWithInfo
        title={title}
        info={tooltip}
        titleClassName="text-mono-120 dark:text-mono-100"
        variant="body3"
      />
    </div>
  );
});

StakingDetailCardItem.displayName = 'StakingDetailCardItem';

const StakingDetailCard = Object.assign(
  {},
  {
    Root: StakingDetailCardRoot,
    Header: StakingDetailCardHeader,
    Body: StakingDetailCardBody,
    Item: StakingDetailCardItem,
  },
);

export type {
  StakingDetailCardBodyProps,
  StakingDetailCardHeaderProps,
  StakingDetailCardItemProps,
  StakingDetailCardRootProps,
};

export {
  StakingDetailCardBody,
  StakingDetailCardHeader,
  StakingDetailCardItem,
  StakingDetailCardRoot,
};

export default StakingDetailCard;
