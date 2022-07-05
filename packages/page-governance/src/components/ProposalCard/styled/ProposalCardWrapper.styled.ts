import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import styled, { css } from 'styled-components';

export const ProposalCardWrapper = styled.div`
  min-height: 72px;
  max-width: 980px;
  margin: 0 auto;
  margin-bottom: 16px;
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.layer1Background};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  border: 1px solid ${({ theme }) => theme.borderColor};

  ${above.md(css`
    padding: 24px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  `)};
`;
