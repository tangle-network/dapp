import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import { BN_ZERO, hexToU8a, stringToU8a, u8aToString } from '@polkadot/util';
import {
  decodeAddress,
  isEthereumAddress,
  keccakAsHex,
} from '@polkadot/util-crypto';
import { useConnectWallet } from '@tangle-network/api-provider-environment/ConnectWallet';
import { useWebContext } from '@tangle-network/api-provider-environment/webb-context';
import {
  WebbError,
  WebbErrorCodes,
} from '@tangle-network/dapp-types/WebbError';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { getApiPromise } from '@tangle-network/tangle-shared-ui/utils/polkadot/api';
import { isValidAddress } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { CheckBox } from '@tangle-network/ui-components/components/CheckBox';
import { useUIContext } from '@tangle-network/ui-components/hooks/useUIContext';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import assert from 'assert';
import { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { isHex } from 'viem';

import ClaimingAccountInput from '../../components/claims/ClaimingAccountInput';
import ClaimRecipientInput from '../../components/claims/ClaimRecipientInput';
import toAsciiHex from '../../utils/claims/toAsciiHex';
import formatTangleBalance from '../../utils/formatTangleBalance';
import getStatement, { Statement } from '../../utils/getStatement';
import type { ClaimInfoType } from './types';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';

enum Step {
  INPUT_ADDRESS,
  SIGN,
  SENDING_TX,
}

type Props = {
  claimInfo: ClaimInfoType;
  setIsClaiming: (isClaiming: boolean) => void;
};

const EligibleSection: FC<Props> = ({
  claimInfo: { totalAmount, vestingAmount, isRegularStatement },
  setIsClaiming,
}) => {
  assert(
    totalAmount.gte(vestingAmount),
    "Total amount can't be less than vesting amount",
  );

  const { activeApi } = useWebContext();
  const { toggleModal } = useConnectWallet();
  const { notificationApi } = useUIContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rpcEndpoints = useNetworkStore((store) => store.network.wsRpcEndpoints);
  const { nativeTokenSymbol } = useNetworkStore();
  const activeAccountAddress = useActiveAccountAddress();

  const [recipient, setRecipient] = useState(
    activeAccountAddress ?? 'Loading...',
  );

  const [recipientErrorMsg, setRecipientErrorMsg] = useState('');
  const [step, setStep] = useState(Step.INPUT_ADDRESS);
  const [statement, setStatement] = useState<null | Statement>(null);
  const [hasReadStatement, setHasReadStatement] = useState(false);

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

  // get statement
  useEffect(() => {
    const fetchStatement = async () => {
      try {
        const api = await getApiPromise(rpcEndpoints);
        const systemChain = await api.rpc.system.chain();
        const statement = getStatement(
          systemChain.toHuman(),
          isRegularStatement,
        );
        setStatement(statement);
      } catch (error) {
        notificationApi({
          message:
            typeof error === 'string'
              ? `Error: ${error}`
              : error instanceof Error
                ? error.message
                : 'Failed to get statement',
          variant: 'error',
        });
      }
    };

    fetchStatement();
  }, [rpcEndpoints, isRegularStatement, notificationApi]);

  const handleClaimClick = useCallback(async () => {
    if (!activeApi || activeAccountAddress === null) {
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
      setIsClaiming(true);
      setStep(Step.SIGN);

      const api = await getApiPromise(rpcEndpoints);
      const accountId = activeAccountAddress;
      const isEvmRecipient = isEthereumAddress(recipient);
      const isEvmSigner = isEthereumAddress(accountId);

      const statementSentence = statement?.sentence || '';

      const prefix = api.consts.claims.prefix.toU8a(true);

      const payload = preparePayload(
        prefix,
        statementSentence,
        recipient,
        isEvmSigner,
        isEvmRecipient,
      );

      const signature = await activeApi.sign(payload);

      setStep(Step.SENDING_TX);

      // TODO: This needs to be changed to use the new hooks.
      const tx = api.tx.claims.claimAttest(
        isEvmRecipient ? { EVM: recipient } : { Native: recipient }, // destAccount
        isEvmSigner ? { EVM: accountId } : { Native: accountId }, // signer
        isEvmSigner ? { EVM: signature } : { Native: signature }, // signature
        statementSentence,
      );

      const txReceiptHash = await sendTransaction(tx);
      const newSearchParams = new URLSearchParams(searchParams.toString());

      // TODO: Need to centralize these search parameters in an enum, in case they ever change.
      newSearchParams.set('h', txReceiptHash);
      newSearchParams.set('rpcEndpoint', rpcEndpoints[0]);

      navigate(`claim/success?${newSearchParams.toString()}`, {
        preventScrollReset: false,
      });
    } catch (error) {
      setIsClaiming(false);
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
    activeApi,
    activeAccountAddress,
    notificationApi,
    setIsClaiming,
    rpcEndpoints,
    recipient,
    statement?.sentence,
    searchParams,
    navigate,
  ]);

  if (activeAccountAddress === null) {
    return null;
  }

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <div className="space-y-4">
          <ClaimingAccountInput
            isDisabled={step !== Step.INPUT_ADDRESS}
            activeAccountAddress={activeAccountAddress}
          />

          <ClaimRecipientInput
            isDisabled={step !== Step.INPUT_ADDRESS}
            error={recipientErrorMsg}
            recipient={recipient}
            setRecipient={setRecipient}
          />
        </div>

        <div className="space-y-4 p-4 border rounded-xl border-mono-0 dark:border-mono-180 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)] bg-glass dark:bg-glass_dark">
          <div>
            <Typography variant="body1" fw="bold" ta="center">
              You will receive the total balance of...
            </Typography>

            <Typography variant="h4" fw="bold" ta="center">
              {`${formatTangleBalance(totalAmount, nativeTokenSymbol)} `}
              {isValidAddress(recipient)
                ? `to ${
                    isHex(recipient)
                      ? shortenHex(recipient)
                      : shortenString(recipient)
                  }`
                : ''}
            </Typography>
          </div>

          {/* Only show this when there's vesting amount */}
          {vestingAmount.gt(BN_ZERO) && (
            <div>
              {/* Free Balance */}
              <Typography variant="body1" fw="bold" ta="center">
                {`${formatTangleBalance(
                  totalAmount.sub(vestingAmount),
                  nativeTokenSymbol,
                )}`}{' '}
                will be available immediately as free balance.
              </Typography>

              {/* Vesting: based on Tangle Genesis Allocations */}
              {/* https://docs.tangle.tools/network/tokenomics/allocation */}
              <Typography variant="body1" fw="bold" ta="center">
                {`${formatTangleBalance(vestingAmount, nativeTokenSymbol)}`}{' '}
                will be vested over 24 months with a 1 month cliff.
              </Typography>
            </div>
          )}
        </div>

        <Typography className="px-4" variant="h5" ta="center">
          <b>Note:</b> You can claim your $TNT airdrop to a Substrate or an EVM
          address.
        </Typography>
      </div>

      {statement !== null && (
        <div className="flex items-start justify-center gap-2">
          <CheckBox
            isChecked={hasReadStatement}
            onChange={() => {
              setHasReadStatement(!hasReadStatement);
            }}
            wrapperClassName="pt-0.5"
          />

          <Typography variant="body1">
            {`I have read and understood the terms and conditions of the statement provided at `}
            <a
              href={statement.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-70 dark:text-blue-50 hover:underline"
            >
              {statement.url}
            </a>
          </Typography>
        </div>
      )}

      <div className="space-y-2">
        <Button
          isFullWidth
          loadingText={getLoadingText(step)}
          isLoading={step !== Step.INPUT_ADDRESS}
          isDisabled={
            !recipient ||
            !!recipientErrorMsg ||
            (statement !== null && !hasReadStatement)
          }
          onClick={handleClaimClick}
        >
          Claim Now
        </Button>

        <Button
          variant="secondary"
          isFullWidth
          onClick={() => toggleModal(true)}
        >
          Connect Another Wallet
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
  isEvmRecipient: boolean,
): string {
  const statementBytes = stringToU8a(statementSentence);

  const addressEncoded = toAsciiHex(
    isEvmRecipient ? hexToU8a(recipient) : decodeAddress(recipient),
  );

  const message = new Uint8Array(
    prefix.length + addressEncoded.length + statementBytes.length,
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
  tx: SubmittableExtrinsic<'promise', ISubmittableResult>,
) {
  console.debug(`Sending transaction with args ${tx.args.toString()}`);

  return new Promise<string>((resolve, reject) => {
    tx.send(async (result) => {
      const status = result.status;
      const events = result.events.filter(
        ({ event: { section } }) => section === 'system',
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
