import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import styled, { css } from 'styled-components';

export const ProposalDetailWrapper = styled.div`
  max-width: 560px;
  margin: 0 auto;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 16px;
`;
