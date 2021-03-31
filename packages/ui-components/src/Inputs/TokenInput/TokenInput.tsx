import React from 'react';
import styled from 'styled-components';

const TokenInputWrapper = styled.div`
  height: 38px;
  width: 140px;
  background: #c8cedd 37%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 31px;
`;
type TokenInputProps = {};

export const TokenInput: React.FC<TokenInputProps> = ({}) => {
  return <TokenInputWrapper>Select Token</TokenInputWrapper>;
};
