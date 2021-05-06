import React, { FC } from 'react';
import styled from 'styled-components';

interface InformationProps {
  title: string;
  content: string;
  variant?: 'success' | 'error' | 'warning' | 'default' | 'info';
}

export const InformationTitle = styled.p<Partial<Pick<InformationProps, 'variant'>>>`
  margin-bottom: 12px;
  font-size: var(--text-size-md);
  line-height: 1.1875;

  color: ${(props) => {
    switch (props.variant) {
      case 'warning':
        return 'var(--notification-warning-color)';
      case 'success':
        return `var(--color-success)`;
      case 'default':
      default:
        return 'var(--information-title-color)';
    }
  }};
`;

export const InformationContent = styled.p<Partial<Pick<InformationProps, 'variant'>>>`
  font-size: var(--text-size-md);
  line-height: 1.375;

  color: ${() => {
    return `var(--text-color-normal)`;
    /*
    switch (props.variant) {
      case 'warning':
        return `var(--notification-warning-color)`;
      case 'success':
        return 'var(--notification-success-color)';
      case 'default':
      default:
        return 'var(--information-content-color)';
    }*/
  }};
`;

export const InformationRoot = styled.div`
  padding: 16px 24px;
  border-radius: 10px;
  background: var(--information-background);
`;

export const Information: FC<InformationProps> = ({ content, title, variant }) => {
  return (
    <InformationRoot>
      <InformationTitle variant={variant}>{title}</InformationTitle>
      <InformationContent variant={variant}>{content}</InformationContent>
    </InformationRoot>
  );
};
