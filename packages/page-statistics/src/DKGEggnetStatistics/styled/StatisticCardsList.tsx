import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import styled from 'styled-components';

export const StatisticCardsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 16px;
  padding: 16px 8px;
  max-width: 380px;

  ${above.xs`
    padding: 16px;
  `}
`;
