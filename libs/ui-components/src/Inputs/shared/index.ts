import { above } from '@nepoche/responsive-utils';
import { css } from 'styled-components';

export * from './ListEmpty';
export * from './styled';

export const sharedLabelCss = css`
  font-family: 'Work Sans', sans-serif;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.02em;

  ${above.xs`
    font-size: 16px;
  `}
`;
