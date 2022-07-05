import React from 'react';
import ContentLoader from 'react-content-loader';

export const LoadingProposals = () => {
  return (
    <ContentLoader
      speed={2}
      style={{ width: '100%', height: '450px' }}
      backgroundColor='#bababa'
      foregroundColor='#ecebeb'
    >
      <rect x='16' y='14' rx='5' ry='5' width='90%' height='72' />
      <rect x='16' y='103' rx='5' ry='5' width='90%' height='72' />
      <rect x='16' y='192' rx='5' ry='5' width='90%' height='72' />
      <rect x='16' y='281' rx='5' ry='5' width='90%' height='72' />
      <rect x='16' y='370' rx='5' ry='5' width='90%' height='72' />
    </ContentLoader>
  );
};
