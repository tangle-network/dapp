import { isPrimitive } from '@webb-tools/dapp-types';
import { ExternalLinkLine } from '@webb-tools/icons/ExternalLinkLine';
import { TitleWithInfo } from '@webb-tools/webb-ui-components/components/TitleWithInfo';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
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

type RestakeDetailCardRootProps = ComponentProps<'div'>;

const RestakeDetailCardRoot = forwardRef<
  HTMLDivElement,
  RestakeDetailCardRootProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      {...props}
      className={twMerge(
        'px-4 py-6 rounded-2xl bg-linear-table space-y-4',
        className,
      )}
      ref={ref}
    >
      {children}
    </div>
  );
});

RestakeDetailCardRoot.displayName = 'RestakeDetailCardRoot';

type RestakeDetailCardHeaderProps<
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

const RestakeDetailCardHeader = forwardRef(
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
    }: RestakeDetailCardHeaderProps<
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
        className={twMerge(
          'flex items-start justify-between pb-3 border-b border-mono-40 dark:border-mono-160',
          className,
        )}
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

RestakeDetailCardHeader.displayName = 'RestakeDetailCardHeader';

type RestakeDetailCardBodyProps = ComponentProps<'div'>;

const RestakeDetailCardBody = forwardRef<
  HTMLDivElement,
  RestakeDetailCardBodyProps
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

RestakeDetailCardBody.displayName = 'RestakeDetailCardBody';

type RestakeDetailCardItemProps = ComponentProps<'div'> & {
  title: string;
  tooltip?: ReactNode;
};

const RestakeDetailCardItem = forwardRef<
  HTMLDivElement,
  RestakeDetailCardItemProps
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

RestakeDetailCardItem.displayName = 'RestakeDetailCardItem';

const RestakeDetailCard = Object.assign(
  {},
  {
    Root: RestakeDetailCardRoot,
    Header: RestakeDetailCardHeader,
    Body: RestakeDetailCardBody,
    Item: RestakeDetailCardItem,
  },
);

export type {
  RestakeDetailCardBodyProps,
  RestakeDetailCardHeaderProps,
  RestakeDetailCardItemProps,
  RestakeDetailCardRootProps,
};

export {
  RestakeDetailCardBody,
  RestakeDetailCardHeader,
  RestakeDetailCardItem,
  RestakeDetailCardRoot,
};

export default RestakeDetailCard;
