'use client';

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import { hexToU8a, stringToU8a, u8aToString } from '@polkadot/util';
import {
  decodeAddress,
  isEthereumAddress,
  keccakAsHex,
} from '@polkadot/util-crypto';
import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import isValidAddress from '@webb-tools/dapp-types/utils/isValidAddress';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { shortenHex } from '@webb-tools/webb-ui-components/utils/shortenHex';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import { useRouter, useSearchParams } from 'next/navigation';
import { FC, useCallback, useEffect, useState } from 'react';
import { isHex } from 'viem';

import ClaimingAccountInput from '../../components/claims/ClaimingAccountInput';
import ClaimRecipientInput from '../../components/claims/ClaimRecipientInput';
import useNetworkStore from '../../context/useNetworkStore';
import toAsciiHex from '../../utils/claims/toAsciiHex';
import getStatement from '../../utils/getStatement';
import { getPolkadotApiPromise } from '../../utils/polkadot';
import type { ClaimInfoType } from './types';

enum Step {
  INPUT_ADDRESS,
  SIGN,
  SENDING_TX,
}

type Props = {
  claimInfo: ClaimInfoType;
  onClaimCompleted: (accountAddress: string) => void;
};

const EligibleSection: FC<Props> = ({
  claimInfo: { amount, isRegularStatement },
  onClaimCompleted,
}) => {
  const { activeAccount, activeApi, activeWallet } = useWebContext();
  const { toggleModal } = useConnectWallet();
  const { notificationApi } = useWebbUI();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [recipient, setRecipient] = useState(activeAccount?.address ?? '');
  const [recipientErrorMsg, setRecipientErrorMsg] = useState('');
  const [step, setStep] = useState(Step.INPUT_ADDRESS);
  const { rpcEndpoint } = useNetworkStore();

  // Validate recipient input address after 500 ms
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (recipient && !isValidAddress(recipient)) {
        setRecipientErrorMsg('Invalid address');
      } else {
        setRecipientErrorMsg('');
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [recipient]);

  const isActiveWalletEvm = activeWallet?.platform === 'EVM';

  const handleClaimClick = useCallback(async () => {
    if (!activeAccount || !activeApi) {
      const message = !activeApi
        ? WebbError.getErrorMessage(WebbErrorCodes.ApiNotReady).message
        : WebbError.getErrorMessage(WebbErrorCodes.NoAccountAvailable).message;

      notificationApi.addToQueue({
        variant: 'error',
        message,
      });
      return;
    }

    try {
      setStep(Step.SIGN);

      const api = await getPolkadotApiPromise(rpcEndpoint);
      const accountId = activeAccount.address;
      const isEvmRecipient = isEthereumAddress(recipient);
      const isEvmSigner = isEthereumAddress(accountId);
      const systemChain = await api.rpc.system.chain();

      const statementSentence =
        getStatement(systemChain.toHuman(), isRegularStatement)?.sentence || '';

      const prefix = api.consts.claims.prefix.toU8a(true);

      const payload = preparePayload(
        prefix,
        statementSentence,
        recipient,
        isEvmSigner,
        isEvmRecipient
      );

      const signature = await activeApi.sign(payload);

      setStep(Step.SENDING_TX);

      const tx = api.tx.claims.claimAttest(
        isEvmRecipient ? { EVM: recipient } : { Native: recipient }, // destAccount
        isEvmSigner ? { EVM: accountId } : { Native: accountId }, // signer
        isEvmSigner ? { EVM: signature } : { Native: signature }, // signature
        statementSentence
      );

      const hash = await sendTransaction(tx);
      const newSearchParams = new URLSearchParams(searchParams.toString());

      newSearchParams.set('h', hash);
      newSearchParams.set('rpcEndpoint', rpcEndpoint);
      onClaimCompleted(accountId);

      router.push(`claim/success?${newSearchParams.toString()}`, {
        scroll: true,
      });
    } catch (error) {
      notificationApi.addToQueue({
        variant: 'error',
        message:
          error instanceof Error
            ? error.message
            : typeof error === 'string'
            ? `Error: ${error}`
            : 'Failed to sign & send transaction',
        secondaryMessage: error instanceof Error ? undefined : String(error),
      });

      setStep(Step.INPUT_ADDRESS);
    }
  }, [
    activeAccount,
    activeApi,
    rpcEndpoint,
    isRegularStatement,
    notificationApi,
    onClaimCompleted,
    recipient,
    router,
    searchParams,
  ]);

  if (!activeAccount) {
    return null;
  }

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <div className="space-y-4">
          <ClaimingAccountInput
            isDisabled={step !== Step.INPUT_ADDRESS}
            activeAccountAddress={activeAccount.address}
          />

          <ClaimRecipientInput
            isDisabled={step !== Step.INPUT_ADDRESS}
            error={recipientErrorMsg}
            recipient={recipient}
            setRecipient={setRecipient}
          />
        </div>

        <div className="flex flex-col gap-4 p-4 border rounded-xl border-mono-0 dark:border-mono-180 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)] bg-glass dark:bg-glass_dark">
          <Typography variant="body1" fw="bold" ta="center">
            You will receive the liquid balance of...
          </Typography>

          <Typography variant="h4" fw="bold" ta="center">
            {`${amount} `}
            {isValidAddress(recipient)
              ? `to ${
                  isHex(recipient)
                    ? shortenHex(recipient)
                    : shortenString(recipient)
                }`
              : ''}
          </Typography>
          <Typography variant="body1" fw="bold" ta="center">
            any additional balance will be vesting in your account.
          </Typography>
        </div>

        <Typography className="px-4" variant="h5" ta="center">
          <b>Note:</b> You can claim your $TNT airdrop to a Substrate or an EVM
          address.
        </Typography>
      </div>

      <div className="space-y-2">
        <Button
          isFullWidth
          loadingText={getLoadingText(step)}
          isLoading={step !== Step.INPUT_ADDRESS}
          isDisabled={!recipient || !!recipientErrorMsg}
          onClick={handleClaimClick}
        >
          Claim Now
        </Button>

        <Button
          variant="secondary"
          isFullWidth
          onClick={() =>
            toggleModal(
              true,
              isActiveWalletEvm
                ? PresetTypedChainId.TangleTestnetNative
                : PresetTypedChainId.TangleTestnetEVM
            )
          }
        >
          Connect {isActiveWalletEvm ? 'Substrate' : 'EVM'} Wallet
        </Button>
      </div>
    </div>
  );
};

export default EligibleSection;

function preparePayload(
  prefix: Uint8Array,
  statementSentence: string,
  recipient: string,
  isEvmSigner: boolean,
  isEvmRecipient: boolean
): string {
  const statementBytes = stringToU8a(statementSentence);

  const addressEncoded = toAsciiHex(
    isEvmRecipient ? hexToU8a(recipient) : decodeAddress(recipient)
  );

  const message = new Uint8Array(
    prefix.length + addressEncoded.length + statementBytes.length
  );

  message.set(prefix, 0);
  message.set(addressEncoded, prefix.length);
  message.set(statementBytes, prefix.length + addressEncoded.length);

  if (isEvmSigner) {
    return u8aToString(message);
  }

  // Otherwise, we need to hash the payload
  return keccakAsHex(message);
}

function sendTransaction(
  tx: SubmittableExtrinsic<'promise', ISubmittableResult>
) {
  console.log(`Sending transaction with args ${tx.args.toString()}`);
  return new Promise<string>((resolve, reject) => {
    tx.send(async (result) => {
      const status = result.status;
      const events = result.events.filter(
        ({ event: { section } }) => section === 'system'
      );

      if (status.isInBlock || status.isFinalized) {
        for (const event of events) {
          const {
            event: { method },
          } = event;
          const dispatchError = result.dispatchError;

          if (dispatchError && method === 'ExtrinsicFailed') {
            let message: string = dispatchError.type;

            if (dispatchError.isModule) {
              try {
                const mod = dispatchError.asModule;
                const error = dispatchError.registry.findMetaError(mod);

                message = `${error.section}.${error.name}`;
              } catch (error) {
                console.error(error);
                reject(message);
              }
            } else if (dispatchError.isToken) {
              message = `${dispatchError.type}.${dispatchError.asToken.type}`;
            }

            reject(message);
          } else if (method === 'ExtrinsicSuccess' && status.isFinalized) {
            // Resolve with the block hash
            resolve(status.asFinalized.toString());
          }
        }
      }
    }).catch((error) => {
      console.error(error);
      reject(error);
    });
  });
}

function getLoadingText(step: Step) {
  switch (step) {
    case Step.SIGN:
      return 'Signing...';
    case Step.SENDING_TX:
      return 'Sending transaction...';
    default:
      return '';
  }
}
