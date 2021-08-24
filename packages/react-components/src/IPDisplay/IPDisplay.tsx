import { Icon, Typography } from '@material-ui/core';
import { useFetch } from '@webb-dapp/react-hooks/';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { getWebbRelayer } from '@webb-dapp/apps/configs/relayer-config';
import { WebbRelayer } from '@webb-dapp/react-environment/webb-context/relayer';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';

const IPDisplayWrapper = styled.div`
  padding: 1rem;
  ${above.sm`  padding: 2rem;`}
  max-width: 500px;
  margin: auto;
  border-radius: 20px;
  display: flex;
  align-items: center;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer1Background};
    border: 1px solid ${theme.borderColor};
    ${theme.type === 'light' ? `box-shadow: 0px 0px 14px rgba(51, 81, 242, 0.11);` : ''}
    .label-icon {
      font-size: 40px;
      color: ${theme.primary};
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

type RelayerIpInfo = {
  ip: String;
  city: String;
  country: String;
};

type IPDisplayProps = {};

const IPDisplay: React.FC<IPDisplayProps> = () => {
  // const { city, countryCode, query } = useFetch(`http://ip-api.com/json/?fields=countryCode,city,query`, {});
  const { activeApi } = useWebContext();

  const [geoLocation, setGeoLocation] = useState<RelayerIpInfo>({ ip: '', city: '', country: '' });

  useEffect(() => {
    async function getIpInfo() {
      const relayer = await activeApi?.relayingManager.getRelayer({})[0];
      if (relayer) {
        const response = await relayer.getIp();
        console.log(response);
        setGeoLocation(response);
      }
    }
    getIpInfo();
  }, [activeApi]);

  return (
    <IPDisplayWrapper>
      <Icon className={'label-icon'} style={{ fontSize: 40 }}>
        room
      </Icon>
      <div style={{ paddingLeft: 5 }}>
        <Typography className={'ip-text'} variant={'h5'}>
          Your IP Address is:{' '}
          <b>
            {geoLocation.ip} {geoLocation.city}, {geoLocation.country}
          </b>
        </Typography>
        <Typography className={'ip-info'}>Please mask your IP address while using our service!</Typography>
        <Typography className={'ip-info'}>
          We recommend <span className={'tor'}>TOR</span>{' '}
        </Typography>
      </div>
    </IPDisplayWrapper>
  );
};

export default IPDisplay;
