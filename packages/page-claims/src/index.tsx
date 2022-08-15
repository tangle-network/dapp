import { FormHelperText, InputBase } from '@mui/material';
import { useClaims } from '@webb-dapp/page-claims/hooks/useClaims';
import { RequiredWalletSelection } from '@webb-dapp/react-components/RequiredWalletSelection/RequiredWalletSelection';
import { pageWithFeatures } from '@webb-dapp/react-components/utils/FeaturesGuard/pageWithFeatures';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { InputTitle } from '@webb-dapp/ui-components/Inputs/InputTitle/InputTitle';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

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

enum ClaimSteps {
  GenerateClaim,
  ConnectToPolkadotProvider,
  SubmitClaim,
}

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

const SigWrapper = styled.div`
  margin: 0 1rem;
  margin-bottom: 8px;

  ${above.sm`
    margin: 0 2rem;
      margin-bottom: 8px;

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
const GeneratedSig = styled.div`
  border-radius: 10px;
  padding: 0.7rem;
  word-break: break-all;
  position: relative;
  min-height: 120px;
  background: ${({ theme }) => theme.heavySelectionBackground};
  color: ${({ theme }) => theme.primaryText};
`;
const PageClaims = () => {
  const { address, error, generateSignature, isValidKey, setAddress, validProvider } = useClaims();
  const [step, setStep] = useState<ClaimSteps>(ClaimSteps.GenerateClaim);
  const [loading, setLoading] = useState(false);
  const [sig, setSig] = useState('');
  const buttonProps = useMemo(() => {
    switch (step) {
      case ClaimSteps.GenerateClaim:
        return {
          disabled: !validProvider || loading,
          onClick: () => {
            try {
              setLoading(true);
              generateSignature().then((sig) => {
                setSig(sig);
                setStep(ClaimSteps.ConnectToPolkadotProvider);
              });
            } catch (e) {
              console.log(e);
            } finally {
              setLoading(false);
            }
          },
          label: 'Generate claim',
        };
      case ClaimSteps.ConnectToPolkadotProvider:
        return {
          label: 'Connect to Polkadot Provider',
          onClick: () => {},
        };
      case ClaimSteps.SubmitClaim: {
        return {
          label: 'Submit claim',
          onClick: () => {},
        };
      }
    }
  }, [step, setSig, sig, isValidKey, generateSignature, loading]);

  const showAddressButton = step === ClaimSteps.GenerateClaim;
  const showSig = step === ClaimSteps.ConnectToPolkadotProvider;

  return (
    <PageClaimsWrapper>
      <RequiredWalletSelection>
        <ClaimWrapper>
          <TitleWrapper>
            <InputTitle leftLabel={showAddressButton ? 'Claim address' : 'Claim signature'} />
          </TitleWrapper>
          {showAddressButton ? (
            <>
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
            </>
          ) : (
            <SigWrapper>
              <GeneratedSig>{sig}</GeneratedSig>
            </SigWrapper>
          )}

          <MixerButtonWrapper>
            <MixerButton {...buttonProps} />
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
