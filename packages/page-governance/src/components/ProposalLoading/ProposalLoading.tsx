import React from 'react';
import ContentLoader from 'react-content-loader';

export const ProposalLoading = () => {
  return (
    <ContentLoader
      speed={2}
      style={{ width: '100%', height: '300px' }}
      backgroundColor='#bababa'
      foregroundColor='#ecebeb'
    >
      <rect x='16' y='14' rx='5' ry='5' width='90%' height='56' />
      <rect x='16' y='87' rx='5' ry='5' width='90%' height='56' />
      <rect x='16' y='160' rx='5' ry='5' width='90%' height='56' />
    </ContentLoader>
  );
};
