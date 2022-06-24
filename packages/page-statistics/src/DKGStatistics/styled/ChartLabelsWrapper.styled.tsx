import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import styled from 'styled-components';

export const ChartLabelsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 12px 0px;
  justify-content: space-evenly;

  ${above.lg`
    justify-content: flex-start;
    max-width: 152px;
  `}
`;
