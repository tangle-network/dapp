import React, { FC } from 'react';
import styled from 'styled-components';

export const InformationRoot = styled.div`
  padding: 16px 24px;
  border-radius: 10px;
  background: var(--information-background);
`;

export const InformationTitle = styled.p`
  margin-bottom: 12px;
  font-size: var(--text-size-md)
  line-height: 1.1875;
  color: var(--information-title-color);
`;

export const InformationContent = styled.p`
  font-size: var(--text-size-md);
  line-height: 1.375;
  color: var(--information-content-color);
`;

interface InformationProps {
  title: string;
  content: string;
}

export const Information: FC<InformationProps> = ({ content, title }) => {
  return (
    <InformationRoot>
      <InformationTitle>{title}</InformationTitle>
      <InformationContent>{content}</InformationContent>
    </InformationRoot>
  );
};
