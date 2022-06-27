import styled from 'styled-components';

export const CircleStatus = styled.div`
  padding: 4px;
  background-color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000')};
  border-radius: 50%;
`;
