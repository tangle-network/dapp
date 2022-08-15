import { FormHelperText, InputBase } from '@mui/material';
import { useClaims } from '@webb-dapp/page-claims/hooks/useClaims';
import { RequiredWalletSelection } from '@webb-dapp/react-components/RequiredWalletSelection/RequiredWalletSelection';
import { pageWithFeatures } from '@webb-dapp/react-components/utils/FeaturesGuard/pageWithFeatures';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { InputTitle } from '@webb-dapp/ui-components/Inputs/InputTitle/InputTitle';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { useEffect, useMemo } from 'react';
import styled, { css } from 'styled-components';

import { decodeAddress } from '@polkadot/keyring';

const PageClaimsWrapper = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0px auto;
  ${above.md`
    flex-direction: row; 
    align-items: flex-start;
  `}
`;
const PublicKeyInputWrapper = styled.div<{ disabled?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  ${({ theme }: { theme: Pallet }) => css`
    border: 1px solid ${theme.heavySelectionBorderColor};
    color: ${theme.primaryText};
    background: ${theme.heavySelectionBackground};
  `}
  height: 50px;
  border-radius: 10px;
  padding: 8px 16px;
  align-items: center;
  justify-content: space-between;

  margin: 0 1rem;
  margin-bottom: 8px;

  ${above.sm`
    margin: 0 2rem; 
    margin-bottom: 8px;
  `}
  && {
    cursor: ${({ disabled }) => (disabled ? 'no-drop' : 'auto')};
  }
`;
const ErrorWrapper = styled.div`
  margin: 0 1rem;

  ${above.sm`
    margin: 0 2rem;
  `}
`;

const TitleWrapper = styled.div`
  padding: 0 1rem;
  padding-top: 1rem;

  ${above.sm`
    padding: 0 2rem;
    padding-top: 2rem;
  `}
`;
const ClaimWrapper = styled.div`
  box-sizing: border-box;
  border-radius: 12px;
  flex: 1;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer2Background};
    border: 1px solid ${theme.borderColor};
  `}
  max-width: 500px;

  .checkbox-wrapper {
    margin-left: -9px;
    padding: 0 1rem;

    ${above.sm`
      padding: 0 2rem;
    `}
  }
`;

const MixerButtonWrapper = styled.div`
  padding: 0 1rem;
  padding-bottom: 1rem;

  ${above.sm`
    padding: 0 2rem;
    padding-bottom: 2rem;
  `}
`;

const PageClaims = () => {
  const { address, error, isValidKey, setAddress } = useClaims();

  return (
    <PageClaimsWrapper>
      <RequiredWalletSelection>
        <ClaimWrapper>
          <TitleWrapper>
            <InputTitle leftLabel={'Claim address'} />
          </TitleWrapper>

          <PublicKeyInputWrapper>
            <InputBase
              fullWidth
              placeholder={`Enter you public key (32 bytes)`}
              value={address}
              inputProps={{ style: { fontSize: 14 } }}
              onChange={(event) => {
                setAddress(event.target.value as string);
              }}
            />
          </PublicKeyInputWrapper>
          <ErrorWrapper>
            <FormHelperText error={Boolean(error)}>{error}</FormHelperText>
          </ErrorWrapper>

          <MixerButtonWrapper>
            <MixerButton disabled={!isValidKey} onClick={() => {}} label={'Claim'} />
          </MixerButtonWrapper>
        </ClaimWrapper>
      </RequiredWalletSelection>
    </PageClaimsWrapper>
  );
};
export default pageWithFeatures({
  features: ['claims'],
  message: 'The claims module is not supported on this chain.',
})(PageClaims);
