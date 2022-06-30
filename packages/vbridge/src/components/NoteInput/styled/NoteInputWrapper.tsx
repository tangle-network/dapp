import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import styled, { css } from 'styled-components';

export const NoteInputWrapper = styled.div`
  display: flex;
  ${({ theme }: { theme: Pallet }) => css`
    border: 1px solid ${theme.heavySelectionBorderColor};
    color: ${theme.primaryText};
    background: ${theme.heavySelectionBackground};
  `}
  height: 36px;
  min-width: 152px;
  width: calc(100% - 88px);
  border-radius: 10px;
  padding: 4px 12px;
  flex-grow: 1;

  ${above.sm`
      width: auto; 
    `}
`;
