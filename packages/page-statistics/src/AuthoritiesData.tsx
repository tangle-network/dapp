import styled from 'styled-components';
import { DemoTable } from '@webb-dapp/page-statistics/provider/DemoTable';
import { useKeys } from '@webb-dapp/page-statistics/provider/hooks/useKeys';
æ;

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
  const data = useKeys({
    offset: 0,
    perPage: 30,
  });

  return (
    <AuthoritiesDataWrapper>
      <DemoTable page={data} />
    </AuthoritiesDataWrapper>
  );
};
