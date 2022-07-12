import styled, { css } from 'styled-components';

import { sharedPaddingStyle } from '../../styled/shared';

export const Wrapper = styled.div<{ hasBorderBottom?: boolean }>`
  ${sharedPaddingStyle};

  ${({ hasBorderBottom = true, theme }) =>
    hasBorderBottom
      ? css`
          border-bottom: 1px solid ${theme.borderColor};
        `
      : undefined}
`;
