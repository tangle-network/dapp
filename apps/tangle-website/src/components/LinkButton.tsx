import { Button, ButtonProps } from '@webb-tools/webb-ui-components';

export const LinkButton = (props: ButtonProps) => {
  const { href, className, children, ...restProps } = props;
  return (
    <Button
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      {...restProps}
    >
      {children}
    </Button>
  );
};
