import { PropsWithChildren } from 'react';
import { Link } from 'react-router';
import { PagePath, QueryParamKey } from '../../types';

export const RestakeOperatorWrapper = ({
  children,
  address,
}: PropsWithChildren<{ address: string }>) => {
  return (
    <Link
      // TODO: Should redirect & auto select operator for delegation
      to={`${PagePath.RESTAKE_DELEGATE}?${QueryParamKey.RESTAKE_OPERATOR}=${address}`}
    >
      {children}
    </Link>
  );
};
