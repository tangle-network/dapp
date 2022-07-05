import React, { useMemo } from 'react';
import ContentLoader from 'react-content-loader';

export const LoadingProposals = () => {
  const totalItems = useMemo(() => 4, []);
  const loadingItemHeight = useMemo(() => 96, []);

  return (
    <ContentLoader
      speed={2}
      style={{ width: '100%', height: (loadingItemHeight * totalItems + 100).toString() }}
      backgroundColor='#bababa'
      foregroundColor='#ecebeb'
    >
      {Array(totalItems)
        .fill(0)
        .map((_, idx) => (
          <rect x='16' y={14 + idx * 120} rx='12' ry='12' width='90%' height={loadingItemHeight} />
        ))}
    </ContentLoader>
  );
};
