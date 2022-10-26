import { Typography } from '@mui/material';
import { LocationLogo } from '@nepoche/logos/LocationLogo';
import { useIp } from '@nepoche/react-hooks/useIp';
import { Pallet, FontFamilies } from '@nepoche/styled-components-theme';
import React from 'react';
import styled, { css } from 'styled-components';

const IPDisplayWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: left;
  padding: 1rem;

  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.lightSelectionBackground};

    svg {
      circle {
        fill: ${theme.accentColor};
      }
    }

    .tor {
      color: ${theme.primary};
    }
  `}

  .ip-text {
    font-family: ${FontFamilies.AvenirNext};

    b {
      font-family: ${FontFamilies.AvenirNext};
    }
  }

  .ip-info {
    font-family: ${FontFamilies.AvenirNext};
    color: #7c7b86;
  }
`;

const IPDisplay: React.FC = () => {
  const { city, countryCode, ip } = useIp();

  function createLocationText() {
    if (city && countryCode) {
      return `${city}, ${countryCode}`;
    }
    return '';
  }

  return (
    <IPDisplayWrapper>
      <LocationLogo />
      <div style={{ paddingLeft: 5, width: '80%' }}>
        <Typography className={'ip-text'} variant={'h5'}>
          <b>Your IP</b>
        </Typography>
        <Typography style={{ lineHeight: 1 }} className={'ip-text'} noWrap={true} variant={'h6'}>
          {ip}
        </Typography>
        <Typography style={{ lineHeight: 1 }} className={'ip-text'} variant={'h6'}>
          {createLocationText()}
        </Typography>
      </div>
    </IPDisplayWrapper>
  );
};

export default IPDisplay;
