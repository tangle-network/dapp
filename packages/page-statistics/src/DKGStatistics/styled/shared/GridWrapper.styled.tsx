import styled, { css } from 'styled-components';

/** Override grid's styles in dark mode */

export const GridWrapper = styled.div`
  .webb-table-pagination-summary {
    color: ${({ theme }) => theme.primaryText};
    margin-bottom: 8px;
  }

  .webb-table-pagination-btn {
    :disabled {
      opacity: 0.7;
      cursor: no-drop !important;
    }

    ${({ theme }) =>
      theme.type !== 'dark'
        ? css``
        : css`
            background-color: ${theme.layer2Background} !important;
            color: ${theme.secondaryText} !important;
            border-color: ${theme.borderColor2} !important;

            :hover:not(:disabled) {
              color: ${theme.primaryText} !important;
              border-color: ${theme.borderColor} !important;
            }
          `}
  }

  .webb-table-pagination-btn-current {
    ${({ theme }) =>
      theme.type !== 'dark'
        ? css``
        : css`
            background-color: ${theme.layer1Background} !important;
            color: ${theme.primaryText} !important;
            border-color: ${theme.borderColor} !important;
          `}
  }
`;
