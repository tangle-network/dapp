import styled from 'styled-components';

export const StatisticCardWrapper = styled.div<{ width?: string }>`
  width: ${({ width }) => (width ? width : '86px')};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-evenly;
  padding: 4px;
`;
