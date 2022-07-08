import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import styled, { css } from 'styled-components';

export const TextWrapper = styled.div`
  .title {
    ${above.md(css`
      width: 480px;
    `)}
  }
`;
