import { above } from '@nepoche/responsive-utils';
import styled, { css } from 'styled-components';

export const TextWrapper = styled.p`
  padding: 8px 0px;
  overflow: auto;
  font-weight: 400;
  font-size: 12px;
  line-height: 1.4;
  letter-spacing: 0.04em;
  color: inherit;

  ${above.xs(css`
    line-height: 1.7;
  `)}
`;
