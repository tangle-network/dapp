import { Pallet } from '@nepoche/styled-components-theme';
import { above } from '@nepoche/responsive-utils';
import styled, { css } from 'styled-components';

export const FixedHeightContentWrapper = styled.div`
  padding: 1rem;
  ${above.sm`  padding: 2rem;`}
  max-width: 500px;
  margin: auto;
  border-radius: 20px;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer1Background};
    border: 1px solid ${theme.borderColor};
    ${theme.type === 'light' ? `box-shadow: 0px 0px 14px rgba(51, 81, 242, 0.11);` : ''}
  `}
  maxHeight: '400px',
  overflow: 'auto',
`;
