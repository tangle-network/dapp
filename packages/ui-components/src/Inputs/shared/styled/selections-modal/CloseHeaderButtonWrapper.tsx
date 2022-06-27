import styled from 'styled-components';

export const CloseHeaderButtonWrapper = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 12px;
  height: 12px;
  padding: 4px;
  border-radius: 50%;
  background-color: ${({ theme }) => (theme.type === 'dark' ? 'rgba(255, 255, 255, 0.26)' : 'rgba(52, 52, 52, 0.26)')};
  cursor: pointer;
`;
