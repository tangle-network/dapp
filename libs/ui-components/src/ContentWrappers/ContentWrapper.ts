import { Pallet } from '@nepoche/styled-components-theme';
import { above } from '@nepoche/responsive-utils';
import styled, { css } from 'styled-components';

export const ContentWrapper = styled.div`
  padding: 1rem;
  ${above.sm`  padding: 2rem;`}
  max-width: 500px;
  margin: auto;
  border-radius: 20px;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer1Background};
    border: 1px solid ${theme.borderColor};
  `}
`;
