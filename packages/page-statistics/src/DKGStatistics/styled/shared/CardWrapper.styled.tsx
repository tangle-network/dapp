import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import styled from 'styled-components';

export const CardWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 16px;
  padding: 16px 8px;

  ${above.xs`
    padding: 16px;
  `}
`;
