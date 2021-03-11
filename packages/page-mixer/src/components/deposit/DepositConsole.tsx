import SubmitDeposit from '@webb-dapp/page-mixer/components/deposit/SubmitDeposit';
import AmountInput from '@webb-dapp/react-components/AmountInput/AmountInput';
import { TokenInput } from '@webb-dapp/react-components/TokenInput';
import { MixerGroupItem, useConstants, useMixerInfos, useMixerProvider } from '@webb-dapp/react-hooks';
import { useBalanceSelect } from '@webb-dapp/react-hooks/useBalanceSelect';
import { Col, Row, SpaceBox } from '@webb-dapp/ui-components';
import { LoggerService } from '@webb-tools/app-util';
import { Asset } from '@webb-tools/sdk-mixer';
import { CurrencyId } from '@webb-tools/types/interfaces';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { CardRoot, CardSubTitle, CardTitle, DepositTitle, TriggerDeposit } from '../common';

const depositLogger = LoggerService.get('Deposit');
// todo get this by selecting assets
export const DepositConsole: FC = () => {
  const mixerInfos = useMixerInfos();
  const { clearAmount, setToken, token, tokenError } = useBalanceSelect();
  const [showDepositModal, setShowDepositModal] = useState(false);

  const handleSuccess = useCallback((): void => clearAmount(), [clearAmount]);

  const isDisabled = useMemo(() => {
    if (typeof token.amount === 'undefined') return true;
    return !!tokenError;
  }, [token, tokenError]);

  const { allCurrencies } = useConstants();

  const handleTokenCurrencyChange = useCallback(
    (currency: CurrencyId) => {
      setToken({ token: currency });
      clearAmount();
    },
    [setToken, clearAmount]
  );
  const items = useMemo(() => {
    return mixerInfos.items;
  }, [mixerInfos]);

  const [item, setItem] = useState<MixerGroupItem | undefined>(undefined);

  const { init, mixer } = useMixerProvider();

  useEffect(() => {
    init().catch();
  }, [init]);

  const params = useCallback(async () => {
    // ensure that this must be checked by isDisabled
    if (!token.token || typeof token.amount === 'undefined') return [];
    if (!item) {
      return [];
    }
    const groupId = item.id;
    if (!mixer) {
      depositLogger.warn(`Mixer isn't instilled yet`);
      return [];
    }
    // todo make toke symbol configurable
    const note = await mixer.generateNote(new Asset(groupId, 'EDG'));
    return new Promise<any[]>((resolve, reject) => {
      mixer
        .deposit(note, (leaf) => {
          const noteString = note.serialize();
          depositLogger.trace('generated note ', noteString);
          depositLogger.info(`Getting params GroupID `, groupId);
          depositLogger.info(`Full params are groupId, noteCommitment]`, [groupId, [leaf]]);
          resolve([groupId, [leaf], noteString]);
          return Promise.resolve(0);
        })
        .catch((e) => {
          depositLogger.error(e);
          reject(e);
        });
    });
  }, [token, item, mixer]);

  return (
    <CardRoot>
      <CardTitle>Deposit</CardTitle>
      <SpaceBox height={16} />
      <CardSubTitle>Deposit tokens into the anonymity pool.</CardSubTitle>
      <SpaceBox height={24} />
      <Row gutter={[0, 24]}>
        <Col>
          <DepositTitle>Deposit Token</DepositTitle>
        </Col>
        <Col span={24}>
          <TokenInput currencies={allCurrencies} onChange={handleTokenCurrencyChange} value={token.token} />
        </Col>

        <Col>
          <DepositTitle>Amount</DepositTitle>
        </Col>
        <Col span={24}>
          <AmountInput items={items} value={item} onChange={setItem} />
        </Col>
        <Col span={24}>
          <TriggerDeposit
            disabled={isDisabled}
            onClick={() => {
              setShowDepositModal(true);
            }}
            size='large'
          >
            Deposit
          </TriggerDeposit>
          <SubmitDeposit
            onSuccess={() => {
              handleSuccess();
              setShowDepositModal(false);
            }}
            open={showDepositModal}
            onClose={() => {
              setShowDepositModal(false);
            }}
            params={params as any}
          />
        </Col>
      </Row>
    </CardRoot>
  );
};
