import styled from 'styled-components';

export const BadgesGroup = styled.div<{ isAlignStart?: boolean }>`
  /* max-width: 400px; */

  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: ${({ isAlignStart }) => (isAlignStart ? 'flex-start' : 'flex-end')};

  --gap: 8px;
  margin: calc(-1 * var(--gap)) 0 0 calc(-1 * var(--gap));
  width: calc(100% + var(--gap));
  margin-top: 0;

  & > * {
    margin: var(--gap) 0 0 var(--gap);
  }
`;
