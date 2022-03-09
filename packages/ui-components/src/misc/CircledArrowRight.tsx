import * as React from 'react';
import styled from 'styled-components';
import { RightArrowIcon } from '../assets/RightArrow';

const CircleWrapper = styled.div`
  display: flex;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  border: ${({ theme }) => theme.type === 'dark' ? `1px solid ${theme.borderColor}` : 'none' };
  background: ${({ theme }) => theme.heavySelectionBackground};
  align-items: center;
  justify-content: center;
`;

const CircledArrowRight: React.FC = () => {

  return (
    <CircleWrapper>
      <RightArrowIcon />
    </CircleWrapper>
  )
}

export default CircledArrowRight;
