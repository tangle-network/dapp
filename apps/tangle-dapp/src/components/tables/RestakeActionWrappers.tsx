import { FC, PropsWithChildren } from 'react';
import { Link, LinkProps } from 'react-router';
import { PagePath, QueryParamKey } from '../../types';

export const RestakeOperatorWrapper: FC<
  PropsWithChildren<Omit<LinkProps, 'to'> & { address: string }>
> = ({ children, address, ...props }) => {
  return (
    <Link
      to={`${PagePath.RESTAKE_DELEGATE}?${QueryParamKey.RESTAKE_OPERATOR}=${address}`}
      {...props}
    >
      {children}
    </Link>
  );
};
