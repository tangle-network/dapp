import clsx from 'clsx';
import React, { FC, memo, ReactNode } from 'react';
import styled from 'styled-components';
import { TextAnimation } from './Animation';

import { BareProps } from './types';

const TitleRoot = styled.div`
  margin-top: 32px;
  font-size: 24px;
  line-height: 28px;
  font-weight: 500;
  color: var(--text-color-primary);
`;

const TitleContent = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between; 
`;

interface BreadcrumbItemData {
  content: ReactNode;
  onClick: () => void;
}

const BreadcrumbItem = styled<FC<{ config: BreadcrumbItemData; isCurrent: boolean } & BareProps>>(({ className, config }) => {
  return (
    <span
      className={className}
      onClick={config.onClick}
    >
      {config.content}
    </span>
  );
})`
  position: relative;
  display: inline-block;
  font-size: 14px;
  line-height: 1.571429;
  color: ${({ isCurrent }): string => isCurrent ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.45)'};
  user-select: none;
  cursor: ${({ isCurrent }): string => isCurrent ? 'normal' : 'pointer'};

  &::after {
    content: '${({ isCurrent }): string => isCurrent ? '' : '/'}';
    margin: 0 8px;
  }

  &::before {
    content: '';
    display: ${({ isCurrent }): string => isCurrent ? 'none' : 'inherit'};
    position: absolute;
    left: 0;
    bottom: -2px;
    width: calc(100% - 20px);
    height: 2px;
    border-radius: 2px;
    background: transparent;
    transition: all .2s;
  }

  &:hover::before {
    background: var(--color-primary);
  }
`;

const Breadcrumb = memo(styled<FC<{ breadcrumb: BreadcrumbItemData[]} & BareProps>>(({ breadcrumb, className }) => {
  return (
    <div className={className}>
      {
        breadcrumb.map((item, index) => (
          <BreadcrumbItem
            config={item}
            isCurrent={index === breadcrumb.length - 1}
            key={'breadcrumb' + item.content}
          />
        ))
      }
    </div>
  );
})`
  margin-top: 16px;
`);

interface TitleProps extends BareProps {
  title: ReactNode;
  breadcrumb?: BreadcrumbItemData[];
  extra?: ReactNode;
}

const Title: FC<TitleProps> = memo(({ breadcrumb, className, extra, title }) => {
  return (
    <TitleRoot className={className}>
      <TitleContent>
        <TextAnimation value={title === '__empty' ? '  ' : title}/>
        {extra ?? null}
      </TitleContent>
      {breadcrumb ? <Breadcrumb breadcrumb={breadcrumb} /> : null}
    </TitleRoot>
  );
});

Title.displayName = 'Title';

const PageContainer = memo(styled.div<{ fullscreen?: boolean }>`
  margin: 0 auto;
  max-width: ${({ fullscreen }): string => fullscreen ? '100%' : '1120px'};
`);

/**
 * @name Page
 * @description page
 */
let _Page: FC<BareProps & { fullscreen?: boolean }> = memo(({ children, className, fullscreen = false }) => {
  return (
    <div className={className}>
      <PageContainer fullscreen={fullscreen}>{children}</PageContainer>
    </div>
  );
});

_Page.displayName = 'Page';

_Page = memo(styled(_Page)`
  flex: 1;
  box-sizing: border-box;
  height: 100vh;
  max-height: 100vh;
  min-height: 100vh;
  /* for firfox doesn't support overlay */
  overflow-y: auto;
  overflow-y: overlay;
  padding: 0 40px;
  padding-bottom: 64px;
  background: var(--platform-background);
`);

const Content: FC<BareProps> = memo(styled.div`
  margin-top: 24px;
`);

interface PageType extends FC<BareProps & { fullscreen?: boolean }> {
  Title: typeof Title;
  Content: typeof Content;
}

export const Page = (_Page as unknown) as PageType;

Page.Title = Title;
Page.Content = Content;

interface SubTitleProps extends BareProps {
  extra?: ReactNode;
  onClick?: () => void;
}

export const SubTitle = memo(styled<FC<SubTitleProps>>(({ children, className, extra, onClick }) => {
  return (
    <div
      className={className}
      onClick={onClick}
    >
      {children}
      {extra}
    </div>
  );
})`
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: ${({ extra }): string => extra ? 'space-between' : 'flex-start'};
  font-size: 16px;
  line-height: 21px;
  font-weight: 500;
  color: var(--text-color-primary);
`);

export interface SubMenuProps extends BareProps {
  content: {
    content: ReactNode;
    key: string;
  }[];
  active: string;
  onClick: (key: string) => void;
}

export const SubMenu = styled(({ active, className, content, onClick }: SubMenuProps) => {
  return (
    <ul className={className}>
      {
        content.map(({ content, key }) => (
          <li
            className={clsx('sub-menu__item', { active: active === key })}
            key={`submenu-${key}`}
            onClick={(): void => onClick(key)}
          >
            {content}
          </li>
        ))
      }
    </ul>
  );
})`
  margin-left: -40px;
  display: flex;
  align-items: stretch;
  list-style: none;

  .sub-menu__item {
    padding-left: 40px;
    transition: color .2s;
    color: var(--text-color-second);
    cursor: pointer;

    &:hover {
      color: var(--color-primary)
    }

    &.active {
      color: var(--text-color-primary);
    }
  }
`;
