import { above } from '@nepoche/responsive-utils';
import styled, { css } from 'styled-components';

export const SelectionWrapper = styled.div`
  border-radius: 4px;
  padding: 12px 18px;
  margin: 0 auto;
  width: 80vw;
  max-width: 320px;

  ${above.sm(css`
    width: 40vw;
    border-radius: 8px;
    padding: 32px;
  `)}
`;
