import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import styled, { css } from 'styled-components';

export const ContentWrapper = styled.div<{ fullWidth?: boolean }>`
  padding: 1rem;
  ${above.sm`  padding: 2rem;`}
  ${({ fullWidth }) =>
    !fullWidth
      ? `max-width: 500px;`
      : `
  width: 100%;
  flex: 1;
  `};

  margin: auto;
  border-radius: 20px;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer1Background};
    border: 1px solid ${theme.borderColor};
    ${theme.type === 'light' ? `box-shadow: 0px 0px 14px rgba(51, 81, 242, 0.11);` : ''}
  `}
`;
