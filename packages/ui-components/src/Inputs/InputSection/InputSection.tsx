import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import styled, { css } from 'styled-components';

export const InputSection = styled.div`
  display: flex;
  ${({ theme }: { theme: Pallet }) => css`
    border: 2px solid ${theme.heavySelectionBorder};
    color: ${theme.primaryText};
    background: ${theme.heavySelectionBackground};
  `}
  padding: 2px;
  border-radius: 10px;
  min-height: 80px;
`;
