import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import styled from 'styled-components';

import { CardWrapper } from './shared';

export const StatisticCardsList = styled(CardWrapper)`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 24px;
  max-width: 550px;

  ${above.md`
    margin-right: 16px;
  `}
`;
