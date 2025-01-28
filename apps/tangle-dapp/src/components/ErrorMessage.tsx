import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { InformationLine } from '@webb-tools/icons';
import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = PropsOf<'p'> & {
  typographyProps?: Partial<ComponentProps<typeof Typography>>;
};

export default function ErrorMessage({
  children,
  className,
  typographyProps: {
    variant = 'body4',
    className: typoClassName,
    ...typographyProps
  } = {},
  ...props
}: Props) {
  return (
    <p
      {...props}
      className={twMerge(
        'flex items-start gap-2 text-red-70 dark:text-red-50',
        className,
      )}
    >
      {isDefined(children) ? (
        <InformationLine
          size="md"
          className="fill-current dark:fill-current mt-1 shrink-0"
        />
      ) : null}

      <Typography
        component="span"
        fw="bold"
        {...typographyProps}
        variant={variant}
        className={twMerge('!text-inherit leading-normal', typoClassName)}
      >
        {children}
      </Typography>
    </p>
  );
}
