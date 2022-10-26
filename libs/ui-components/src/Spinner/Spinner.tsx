import { Pallet } from '@nepoche/styled-components-theme';
import React, { useState } from 'react';
import styled from 'styled-components';

const SpinnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 100%;
    ${({ theme }: { theme: Pallet }) => (theme.type === 'dark' ? '    filter: invert(0.85);' : '')};
  }
`;
type SpinnerProps = {
  backup?: JSX.Element;
};

export const Spinner: React.FC<SpinnerProps> = ({ backup }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <SpinnerWrapper>
      <img
        src='webb-loader.gif'
        alt=''
        onLoad={() => setLoaded(true)}
        style={{
          width: loaded ? 'unset' : 0,
        }}
      />
      {(!loaded && backup) || null}
    </SpinnerWrapper>
  );
};
