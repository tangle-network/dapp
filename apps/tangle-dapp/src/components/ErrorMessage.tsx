import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { InformationLine } from '@tangle-network/icons';
import type { PropsOf } from '@tangle-network/ui-components/types';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = PropsOf<'p'> & {
  typographyProps?: Partial<ComponentProps<typeof Typography>>;
};

export default function ErrorMessage({
  children,
  className,
  typographyProps: {
    variant = 'body3',
    className: typoClassName,
    ...typographyProps
  } = {},
  ...props
}: Props) {
  return (
    <p
      {...props}
      className={twMerge(
        'flex items-center justify-start gap-0.5 text-red-70 dark:text-red-50 mt-2',
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
