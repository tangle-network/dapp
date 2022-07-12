import { Chip } from '@webb-dapp/ui-components/Chip';
import styled from 'styled-components';

export const ChipWrapper = styled(Chip).attrs({
  color: 'default',
  size: 'small',
})`
  font-size: 12px;
  font-weight: 700;
`;
