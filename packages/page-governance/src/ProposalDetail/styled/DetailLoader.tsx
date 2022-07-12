import React from 'react';
import styled from 'styled-components';

import { sharedPaddingStyle } from './shared';

const Wrapper = styled.div`
  ${sharedPaddingStyle}
`;

const Img = styled.img`
  width: 100%;
`;

export const DetailLoader: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
  <Wrapper>
    <Img {...props} />
  </Wrapper>
);
