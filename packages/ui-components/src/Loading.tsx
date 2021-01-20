import React, { FC } from 'react';
import styled, { keyframes } from 'styled-components';
import { Skeleton } from 'antd';

import { BareProps } from './types';

interface Props extends BareProps {
  width?: number;
}

const ringAnimation = keyframes`
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingRoot = styled.div<{ width: number }>`
  position: relative;
  width: 40px;
  height: 40px;

  > div {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: ${({ width }): number => width}px solid var(--color-primary);
    animation: ${ringAnimation} 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }

  > div:nth-child(1) {
    border-color: var(--color-primary) transparent transparent transparent;
    animation-delay: -0.45s;
  }

  > div:nth-child(2) {
    border-color: transparent var(--color-primary) transparent transparent;
    animation-delay: -0.3s;
  }

  > div:nth-child(3) {
    border-color: transparent transparent var(--color-primary) transparent;
    animation-delay: -0.15s;
  }

  > div:nth-child(4) {
    border-color: transparent transparent transparent var(--color-primary);
  }
`;

export const Loading: FC<Props> = ({ className, width }) => {
  return (
    <LoadingRoot
      className={className}
      width={width ?? 4 }
    >
      <div />
      <div />
      <div />
      <div />
    </LoadingRoot>
  );
};

export const PageLoading: FC = styled(({ className }) => {
  return (
    <div className={className}>
      <Loading/>
    </div>
  );
})`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
`;

export const CardLoading = styled(({ className, height }) => {
  return (
    <div
      className={className}
      style={{ height }}
    >
      <Loading/>
    </div>
  );
})`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  height: 480px;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
`;

const PageContentSkeleton = styled(Skeleton)`
  & li {
    width: 100% !important;
    height: calc(100vh - 60px - 64px - 30px) !important;
    border-radius: 16px;
  }
`;

export const PageContentLoading: FC = () => {
  return (
    <PageContentSkeleton
      active
      paragraph={{ rows: 1 }}
      title={false}
    />
  );
};
