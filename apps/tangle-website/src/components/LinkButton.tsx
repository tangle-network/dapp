import { Button, ButtonProps } from '@webb-tools/webb-ui-components';
import { twMerge } from 'tailwind-merge';

export const LinkButton = (props: ButtonProps) => {
  const { href, className, children, ...restProps } = props;
  return (
    <Button
      href={href}
      target="_blank"
      rel="noreferrer"
      className={twMerge('button-base', className)}
      {...restProps}
    >
      {children}
    </Button>
  );
};
