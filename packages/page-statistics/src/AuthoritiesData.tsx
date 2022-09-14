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
  return <AuthoritiesDataWrapper></AuthoritiesDataWrapper>;
};
