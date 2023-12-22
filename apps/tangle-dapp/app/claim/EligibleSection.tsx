'use client';

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import isValidAddress from '@webb-tools/dapp-types/utils/isValidAddress';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { WebbPolkadot } from '@webb-tools/polkadot-api-provider/webb-provider';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { shortenHex } from '@webb-tools/webb-ui-components/utils/shortenHex';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import { useCallback, useEffect, useState } from 'react';
import { isHex } from 'viem';

import ClaimingAccountInput from '../../components/claims/ClaimingAccountInput';
import ClaimRecipientInput from '../../components/claims/ClaimRecipientInput';
import { STATEMENT_KIND } from '../../constants/claims';
import { getPolkadotApiPromise } from '../../constants/polkadot';

const EligibleSection = () => {
  const { activeAccount, activeApi } = useWebContext();
  const { notificationApi } = useWebbUI();

  const [recipient, setRecipient] = useState(activeAccount?.address ?? '');

  const [recipientErrorMsg, setRecipientErrorMsg] = useState('');

  const [signature, setSignature] = useState('');

  const [claiming, setClaiming] = useState(false);

  // Validate recipient input address after 1s
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
      setClaiming(true);
      const signature = await activeApi.sign(
        activeAccount.address.concat('\n').concat(STATEMENT_KIND.Regular)
      );

      setSignature(signature);

      if (activeApi instanceof WebbPolkadot) {
        const hash = await activeApi.methods.claim.core.claim(
          recipient,
          signature
        );

        notificationApi.addToQueue({
          variant: 'success',
          message: `Claimed successfully!`,
          secondaryMessage: `Block hash: ${hash}`,
        });
      } else {
        const api = await getPolkadotApiPromise();
        if (!api) {
          throw WebbError.from(WebbErrorCodes.ApiNotReady);
        }

        const isDestAccountEth = isEthereumAddress(recipient);
        const isSignerEth = isEthereumAddress(activeAccount.address);

        const tx = api.tx.claims.claim(
          isDestAccountEth ? { EVM: recipient } : { Native: recipient }, // destAccount
          isSignerEth
            ? { EVM: activeAccount.address }
            : { Native: activeAccount.address }, // signer
          isDestAccountEth ? { EVM: signature } : { Native: signature } // signataure
        );

        const hash = await sendTransaction(tx);

        notificationApi.addToQueue({
          variant: 'success',
          message: `Claimed successfully!`,
          secondaryMessage: `Block hash: ${hash}`,
        });
      }
    } catch (error) {
      notificationApi.addToQueue({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Failed to sign',
        secondaryMessage: error instanceof Error ? undefined : String(error),
      });
    } finally {
      setClaiming(false);
    }
  }, [activeAccount, activeApi, notificationApi, recipient]);

  if (!activeAccount) {
    return null;
  }

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <div className="space-y-4">
          <ClaimingAccountInput activeAccountAddress={activeAccount.address} />

          <ClaimRecipientInput
            error={recipientErrorMsg}
            recipient={recipient}
            setRecipient={setRecipient}
          />
        </div>

        <div
          className="flex flex-col gap-4 p-4 border rounded-xl border-mono-0 dark:border-mono-180 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)]"
          style={{
            backgroundColor:
              'linear-gradient(180deg,rgba(255, 255, 255, 0.8) 0.18%,rgba(255, 255, 255, 0) 146.88%)',
          }}
        >
          <Typography variant="body1" fw="bold" ta="center">
            You will receive...
          </Typography>

          <Typography variant="h4" fw="bold" ta="center">
            900 TNT{' '}
            {isValidAddress(recipient)
              ? `to ${
                  isHex(recipient)
                    ? shortenHex(recipient)
                    : shortenString(recipient)
                }`
              : ''}
          </Typography>
        </div>

        <Typography className="px-4" variant="h5" ta="center">
          <b>Note:</b> You can claim your $TNT airdrop to a Substrate or an EVM
          address.
        </Typography>
      </div>

      <Button
        isFullWidth
        loadingText={signature ? 'Claiming...' : 'Signing...'}
        isLoading={claiming}
        isDisabled={!recipient || !!recipientErrorMsg}
        onClick={handleClaimClick}
      >
        {signature ? 'Claim Now' : 'Sign & Claim'}
      </Button>
    </div>
  );
};

export default EligibleSection;

function sendTransaction(
  tx: SubmittableExtrinsic<'promise', ISubmittableResult>
) {
  return new Promise<string>((resolve, reject) => {
    tx.send(async (result) => {
      const status = result.status;
      const events = result.events.filter(
        ({ event: { section } }) => section === 'system'
      );

      if (status.isInBlock || status.isFinalized) {
        for (const event of events) {
          const {
            event: { data, method },
          } = event;
          const [dispatchError] = data as any;

          if (method === 'ExtrinsicFailed') {
            let message = dispatchError.type;

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
