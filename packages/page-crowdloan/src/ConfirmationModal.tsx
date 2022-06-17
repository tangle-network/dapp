import { Link, Typography, TypographyProps } from '@material-ui/core';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { above, useBreakpoint } from '@webb-dapp/ui-components/utils/responsive-utils';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import tinycolor from 'tinycolor2';

const ConfirmationWrapper = styled.div`
  padding: 1rem;
  padding-top: 2rem;
  max-width: 320px;
  margin: 0 auto;

  ${above.sm`
    padding: 2rem; 
    padding-top: 3rem;
  `}

  .heading {
    padding-right: 1rem;
    font-weight: 700;
  }
`;

const InfoWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 75%;
  margin-top: 24px;
`;

const LabelsWrapper = styled.div``;

const ValuesWrapper = styled.div``;

const ButtonWrapper = styled.div`
  margin-top: 8px;
`;

export type ConfirmationModalProps = {
  onClose: () => void;
  txUrl: string;
  amountContributed: FixedPointNumber;
  estRewards: FixedPointNumber;
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  amountContributed,
  estRewards,
  onClose,
  txUrl,
}) => {
  const theme = useColorPallet();
  const { isXsOrAbove } = useBreakpoint();

  const linkColor = useMemo(
    () =>
      theme.type === 'dark'
        ? tinycolor(theme.accentColor).saturate().lighten()
        : tinycolor(theme.accentColor).saturate().darken(),
    [theme]
  );
  const sharedTypoProps = useMemo(
    () =>
      ({
        variant: isXsOrAbove ? 'body1' : 'subtitle1',
      } as Partial<TypographyProps>),
    [isXsOrAbove]
  );

  return (
    <ConfirmationWrapper>
      <Typography variant={isXsOrAbove ? 'h4' : 'h5'} className='heading'>
        Congratulations and thank you for your contribution!
      </Typography>

      <InfoWrapper>
        <LabelsWrapper>
          <Typography {...sharedTypoProps}>
            <b>KSM contributed:</b>
          </Typography>
          <Typography {...sharedTypoProps}>
            <b>Est. Rewards</b>
          </Typography>
        </LabelsWrapper>
        <ValuesWrapper>
          <Typography {...sharedTypoProps}>{amountContributed.toNumber().toLocaleString()}</Typography>
          <Typography {...sharedTypoProps}>
            {isNaN(estRewards.toNumber()) ? '-' : estRewards.toNumber().toLocaleString()}
          </Typography>
        </ValuesWrapper>
      </InfoWrapper>

      <Typography variant={isXsOrAbove ? 'subtitle1' : 'caption'} component='p' style={{ marginTop: '24px' }}>
        Check your contribution transaction here{' '}
        <Link href={txUrl} underline='hover' target='_blank' rel='noreferrer' style={{ color: linkColor.toString() }}>
          (link)
        </Link>
        .
      </Typography>

      <ButtonWrapper>
        <MixerButton label='DONE' onClick={onClose} />
      </ButtonWrapper>
    </ConfirmationWrapper>
  );
};
