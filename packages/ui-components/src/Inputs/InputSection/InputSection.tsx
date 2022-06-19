import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import styled, { css } from 'styled-components';

export const InputSection = styled.div`
  display: flex;
  ${({ theme }: { theme: Pallet }) => css`
    border: 2px solid ${theme.heavySelectionBorderColor};
    color: ${theme.primaryText};
    background: ${theme.heavySelectionBackground};
  `};
  padding: 12px;
  border-radius: 10px;
  justify-content: space-between;
  align-items: center;

  ${above.sm`
    padding: 16px;
  `}
`;
