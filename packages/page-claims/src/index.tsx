import { Button, FormHelperText, InputBase, Typography } from '@mui/material';
import { useClaims } from '@webb-dapp/page-claims/hooks/useClaims';
import { RequiredWalletSelection } from '@webb-dapp/react-components/RequiredWalletSelection/RequiredWalletSelection';
import { pageWithFeatures } from '@webb-dapp/react-components/utils/FeaturesGuard/pageWithFeatures';
import { SpaceBox } from '@webb-dapp/ui-components';
import { MixerButton } from '@webb-dapp/ui-components/Buttons/MixerButton';
import { InputTitle } from '@webb-dapp/ui-components/Inputs/InputTitle/InputTitle';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { decodeAddress } from '@polkadot/keyring';
import { hexToU8a, u8aToString } from '@polkadot/util';

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
  min-height: 80px;
  background: ${({ theme }) => theme.heavySelectionBackground};
  color: ${({ theme }) => theme.primaryText};
`;

type ClaimedModalProps = {
  open: boolean;
  ethAddress: string;
  amount: string;
  txHash: string;
  close: () => void;
};
const ClaimSuccessModal: React.FC<ClaimedModalProps> = ({ amount, close, ethAddress, open, txHash }) => {
  return (
    <Modal open={open}>
      <div>
        <Typography variant='h3'>Claim Success</Typography>
        <Typography>Your claim request for {ethAddress} has been successfully submitted.</Typography>
        <Typography>You have received {amount}</Typography>
        <Typography>TX hash :{txHash}</Typography>
      </div>

      <SpaceBox height={10} />

      <div className={'cancel-button-container'}>
        <Button
          onClick={() => {
            close();
          }}
          className={'cancel-button'}
        >
          Ok
        </Button>
      </div>
    </Modal>
  );
};

const PageClaims = () => {
  const {
    address,
    error,
    generateSignature,
    isValidKey,
    queryClaim,
    setAddress,
    submitClaim,
    switchToPolkadotWallet,
    validProvider,
  } = useClaims();
  const [step, setStep] = useState<ClaimSteps>(ClaimSteps.GenerateClaim);
  const [loading, setLoading] = useState(false);
  const [sig, setSig] = useState('');
  const [amountToBeClaimed, setAmountToBeClaimed] = useState<null | string>(null);
  const [ethAddress, setEthAddress] = useState<null | string>(null);
  const [claimedModal, setClaimedModal] = useState({
    open: false,
    txHash: '',
    amount: '',
    ethAddress: '',
  });
  const ss58Address = useMemo(() => {
    if (isValidKey) {
      const ss58 = address.startsWith('0x') ? u8aToString(decodeAddress(address)) : address;
      try {
        console.log(decodeAddress(ss58));
      } catch (e) {
        console.log(e);
      }
      return ss58;
    }
    return null;
  }, [address, isValidKey]);

  const canClaim = useMemo(() => {
    if (step > ClaimSteps.GenerateClaim) {
      return amountToBeClaimed !== null;
    }
  }, [amountToBeClaimed, step]);

  const buttonProps = useMemo(() => {
    switch (step) {
      case ClaimSteps.GenerateClaim:
        return {
          disabled: !validProvider || loading,
          onClick: async () => {
            try {
              setLoading(true);
              const { account, sig } = await generateSignature();
              setSig(sig);
              setStep(ClaimSteps.ConnectToPolkadotProvider);
              setEthAddress(account);
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
          label: true ? 'Connect to Polkadot Provider' : 'Regenerate sig',
          disabled: loading,
          onClick: async () => {
            // TODO: make this work once we have multiple providers
            /*if (!canClaim) {
              setSig('');
              setAddress('');
              setStep(ClaimSteps.GenerateClaim);
              return;
            }*/
            setLoading(true);
            try {
              await switchToPolkadotWallet();
              queryClaim(ethAddress)
                .then((am) => setAmountToBeClaimed(am))
                .catch((e) => {
                  console.log(e);
                });
              setStep(ClaimSteps.SubmitClaim);
            } finally {
              setLoading(false);
            }
          },
        };
      case ClaimSteps.SubmitClaim: {
        return {
          label: `Claim ${amountToBeClaimed ? `${amountToBeClaimed} WEBB` : '0'}`,
          onClick: async () => {
            try {
              setLoading(true);
              const hash = await submitClaim(ss58Address!, hexToU8a(sig));
              setClaimedModal((c) => ({
                ...c,
                open: true,
                txHash: hash,
                ethAddress: ethAddress,
                amount: `${amountToBeClaimed} WEBB`,
              }));
              setStep(ClaimSteps.GenerateClaim);
            } catch (e) {
              console.log(e);
            } finally {
              setLoading(false);
            }
          },
        };
      }
    }
  }, [
    ethAddress,
    submitClaim,
    canClaim,
    step,
    setSig,
    sig,
    generateSignature,
    loading,
    ss58Address,
    switchToPolkadotWallet,
    validProvider,
    amountToBeClaimed,
  ]);
  useEffect(() => {
    if (ethAddress) {
      queryClaim(ethAddress)
        .then((am) => setAmountToBeClaimed(am))
        .catch((e) => {
          console.log(e);
        });
    }
  }, [queryClaim, ethAddress, validProvider]);
  const showAddressButton = step === ClaimSteps.GenerateClaim;

  return (
    <PageClaimsWrapper>
      <RequiredWalletSelection>
        <ClaimWrapper>
          {showAddressButton ? (
            <>
              <TitleWrapper>
                <InputTitle leftLabel={'Enter a valid substrate public key or ss58 address'} />
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
            </>
          ) : (
            <>
              <TitleWrapper>
                <InputTitle leftLabel={'Account Signature'} />
              </TitleWrapper>

              <SigWrapper>
                <GeneratedSig>{sig}</GeneratedSig>
              </SigWrapper>

              <TitleWrapper style={{ paddingTop: 0 }}>
                <InputTitle leftLabel={'AccountId'} />
              </TitleWrapper>
              <SigWrapper>
                <GeneratedSig> {ss58Address}</GeneratedSig>
              </SigWrapper>
            </>
          )}

          <MixerButtonWrapper>
            <MixerButton {...buttonProps} />
          </MixerButtonWrapper>
          <ClaimSuccessModal
            onClose={() => {
              setClaimedModal({
                open: false,
                ethAddress: '',
                txHash: '',
                amount: '',
              });
            }}
            {...claimedModal}
          />
        </ClaimWrapper>
      </RequiredWalletSelection>
    </PageClaimsWrapper>
  );
};
export default pageWithFeatures({
  features: ['claims'],
  message: 'The claims module is not supported on this chain.',
})(PageClaims);
