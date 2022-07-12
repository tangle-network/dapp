import styled from 'styled-components';

import { iconSize } from './shared.styled';

export const PercentValueWrapper = styled.div`
  width: ${iconSize};
  height: ${iconSize};
  border: 1px solid ${({ theme }) => theme.primaryText};
  border-radius: 50%;
  color: ${({ theme }) => theme.primaryText};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
`;
