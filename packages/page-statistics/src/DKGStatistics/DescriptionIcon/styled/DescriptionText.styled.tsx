import { Typography } from '@material-ui/core';
import styled from 'styled-components';

export const DescriptionText = styled(Typography)`
  display: block;
  padding: 8px 16px;
  background: ${({ theme }) => theme.layer1Background};
  border: 0.5px solid ${({ theme }) => theme.borderColor};
  border-radius: 4px;
`;
