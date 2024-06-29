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
  if (!isDefined(children)) {
    return null;
  }

  return (
    <p
      {...props}
      className={twMerge(
        'flex items-center gap-2 text-red-70 dark:text-red-50 h-4 mt-2',
        className,
      )}
    >
      <InformationLine size="md" className="!fill-current" />
      <Typography
        component="span"
        fw="bold"
        {...typographyProps}
        variant={variant}
        className={twMerge('!text-inherit', typoClassName)}
      >
        {children}
      </Typography>
    </p>
  );
}
