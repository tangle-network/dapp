import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import { css } from 'styled-components';

export const sharedPaddingStyle = css`
  padding: 14px 12px;

  ${above.xs(css`
    padding: 35px 25px;
  `)}
`;
