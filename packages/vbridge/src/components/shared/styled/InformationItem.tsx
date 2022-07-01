import styled from 'styled-components';

export const InformationItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  :not(:last-child) {
    margin-bottom: 12px;
  }
`;
