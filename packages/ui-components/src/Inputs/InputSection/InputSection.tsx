import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import styled, { css } from 'styled-components';

export const InputSection = styled.div`
  ${({ theme }: { theme: Pallet }) => css`
    border: 2px solid ${theme.borderColor2};
    color: ${theme.primaryText};
    background: ${theme.layer2Background};
  `}
  padding: 10px;
  border-radius: 10px;
  min-height: 80px;
`;
