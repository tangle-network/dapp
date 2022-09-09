import { useMemo } from 'react';
import styled from 'styled-components';

import { useCurrentSessionAuthoritiesQuery } from './generated/graphql';

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
  const { data, error, loading } = useCurrentSessionAuthoritiesQuery();
  console.log(data, error, loading);
  const currentSession = useMemo(() => {
    return data?.sessions?.nodes[0];
  }, [data]);

  if (loading || !currentSession) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Something went wrong</div>;
  }

  return (
    <AuthoritiesDataWrapper>
      <pre>{JSON.stringify(currentSession, null, 2)}</pre>
    </AuthoritiesDataWrapper>
  );
};
