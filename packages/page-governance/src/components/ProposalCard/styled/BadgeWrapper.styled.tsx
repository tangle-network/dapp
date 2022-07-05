import styled from 'styled-components';

export const BadgeWrapper = styled.span`
  padding: 4px 12px;
  color: ${({ theme }) => theme.primaryText};
  background-color: ${({ theme }) => theme.layer1Background};
  border-radius: 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;

  .bold {
    font-weight: 700;
    margin-left: 4px;
    color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : theme.primartyText)};
  }
`;
