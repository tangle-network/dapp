import { Typography } from '@mui/material';
import styled from 'styled-components';

export const Title = styled(Typography).attrs({
  variant: 'body1',
})`
  && {
    color: ${({ theme }) => (theme.type === 'dark' ? 'rgba(255, 255, 255, 0.69)' : 'rgba(0, 0, 0, 0.69)')};
  }
`;
