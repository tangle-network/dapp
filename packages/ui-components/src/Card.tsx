import React, { ReactNode, forwardRef } from 'react';
import clsx from 'clsx';

import { BareProps } from './types';
import styled from 'styled-components';

export interface CardRootProps {
  showShadow?: boolean;
  overflowHidden?: boolean;
}

export interface CardProps extends BareProps, CardRootProps {
  headerClassName?: string;
  contentClassName?: string;
  header?: ReactNode;
  extra?: ReactNode;
  divider?: boolean;
  padding?: boolean;
}

export const CardRoot = styled.section<CardRootProps>`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background: var(--card-background);
  border: 1px solid var(--color-border);
  box-shadow: ${({ showShadow }): string => (showShadow ? 'var(--card-shadow)' : 'none')};
  overflow: ${({ overflowHidden }): string => (overflowHidden ? 'hidden' : 'visible')};
  border-radius: 12px;

  .ant-row {
    width: 100%;
  }
`;

const CardHeader = styled.div<{ divider: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 22px 24px 24px 24px;
  border-bottom: ${({ divider }): string => (divider ? '1px solid #ecf0f2' : 'none')};
  color: var(--text-color-primary);
  font-size: 16px;
  line-height: 1.1875;
  font-weight: 500;

  .card__header__extra {
    font-size: 16px;
    font-weight: normal;
    color: var(--text-color-second);
  }
`;

const CardContent = styled.div<{ padding: number; paddingTop: number }>`
  box-sizing: border-box;
  width: 100%;
  padding: ${({ padding }): number => padding}px;
  padding-top: ${({ padding, paddingTop }): number => (padding ? paddingTop : 0)}px;
`;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      contentClassName,
      divider = true,
      extra,
      header,
      headerClassName,
      overflowHidden = false,
      padding = true,
      showShadow = true,
    },
    ref
  ) => {
    return (
      <CardRoot className={className} overflowHidden={overflowHidden} ref={ref} showShadow={showShadow}>
        {header ? (
          <CardHeader className={clsx(headerClassName, 'card__header')} divider={divider}>
            {header}
            {extra ? <div className='card__header__extra'>{extra}</div> : null}
          </CardHeader>
        ) : null}
        <CardContent
          className={clsx('card__content', contentClassName)}
          padding={padding ? 24 : 0}
          paddingTop={header ? 0 : 24}
        >
          {children}
        </CardContent>
      </CardRoot>
    );
  }
);

Card.displayName = 'Card';
