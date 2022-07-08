import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import { Link, LinkProps } from 'react-router-dom';
import styled, { css } from 'styled-components';

export const ProposalCardWrapper = styled(Link)<LinkProps>`
  min-height: 72px;
  max-width: 980px;
  margin: 0 auto;
  margin-bottom: 16px;
  padding: 12px 14px;
  background-color: transparent;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  border: 1px solid ${({ theme }) => theme.borderColor};
  cursor: pointer;
  transition: transform 100ms ease-in-out;

  :hover {
    transform: scale(1.01);
  }

  ${above.md(css`
    padding: 24px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  `)};
`;
