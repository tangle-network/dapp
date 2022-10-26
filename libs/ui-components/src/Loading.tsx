import React, { FC } from 'react';
import styled from 'styled-components';

const PageContentSkeleton = styled.div`
  & li {
    width: 100% !important;
    height: calc(100vh - 60px - 64px - 30px) !important;
    border-radius: 16px;
  }
`;

export const PageContentLoading: FC = () => {
  return <PageContentSkeleton />;
};
