import { FC, PropsWithChildren } from 'react';
import { Link, LinkProps } from 'react-router';

export const StakingOperatorWrapper: FC<
  PropsWithChildren<
    Omit<LinkProps, 'to'> & {
      pagePath: string;
      queryParamKey: string;
      address: string;
    }
  >
> = ({ children, pagePath, queryParamKey, address, ...props }) => {
  return (
    <Link to={`${pagePath}?${queryParamKey}=${address}`} {...props}>
      {children}
    </Link>
  );
};

export default StakingOperatorWrapper;
