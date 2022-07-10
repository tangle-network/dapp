import { Button } from '@material-ui/core';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import styled, { css } from 'styled-components';

export const BackButton = styled(Button)`
  && {
    background-color: ${({ theme }) => theme.lightSelectionBackground};
    color: ${({ theme }) => theme.primaryText};
    border-radius: 9999px;
    padding: 5px 10px;
    border: ${({ theme }) => (theme.type === 'dark' ? `1px solid ${theme.borderColor}` : 'none')};
    margin-bottom: 16px;

    :hover {
      background-color: ${({ theme }) => theme.heavySelectionBackground};
    }

    ${above.xs(css`
      padding: 10px 20px;
    `)}
  }
`;
