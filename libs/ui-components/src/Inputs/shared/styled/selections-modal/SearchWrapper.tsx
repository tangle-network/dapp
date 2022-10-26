import { above } from '@nepoche/responsive-utils';
import styled, { css } from 'styled-components';

export const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  border-radius: 8px;
  padding: 4px 8px;
  margin-top: 12px;
  transition: none;
  background-color: ${({ theme }) => theme.lightSelectionBackground};
  :hover {
    background-color: ${({ theme }) => theme.heavySelectionBackground};
  }

  ${above.sm(css`
    padding: 8px 16px;
  `)}
`;
