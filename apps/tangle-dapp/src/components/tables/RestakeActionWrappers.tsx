import { PropsWithChildren } from 'react';
import { Link } from 'react-router';
import { PagePath } from '../../types';

export const ViewOperatorWrapper = ({
  children,
  address,
}: PropsWithChildren<{ address: string }>) => {
  return <Link to={`${PagePath.RESTAKE_OPERATOR}/${address}`}>{children}</Link>;
};

export const RestakeOperatorWrapper = ({
  children,
  address,
}: PropsWithChildren<{ address: string }>) => {
  return <Link to={`${PagePath.RESTAKE_OPERATOR}/${address}`}>{children}</Link>;
};
