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
        'flex items-center justify-center gap-0.5 text-red-70 dark:text-red-50 mt-2 ml-2',
        className,
      )}
    >
      {isDefined(children) ? (
        <InformationLine size="md" className="fill-current dark:fill-current" />
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
