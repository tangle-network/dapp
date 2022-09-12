import { useKeys } from '@webb-dapp/page-statistics/provider/hooks/useKeys';
import { useMemo } from 'react';
import styled from 'styled-components';

export interface DKGAuthority {
  authorityId: string;

  accountId: string;

  reputation?: string;
}

const AuthoritiesDataWrapper = styled.div`
  color: red;
  white-space: pre;
`;

export const AuthoritiesData = () => {
  const data = useKeys();

  if (!data.val || data.isLoading) {
    return <AuthoritiesDataWrapper>...</AuthoritiesDataWrapper>;
  }
  if (data.isFailed) {
    return <AuthoritiesDataWrapper>FAILED:{data.error}</AuthoritiesDataWrapper>;
  }
  return (
    <AuthoritiesDataWrapper>
      <pre>{JSON.stringify(data.val, null, 2)}</pre>
    </AuthoritiesDataWrapper>
  );
};
