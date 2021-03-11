import SubmitDeposit from '@webb-dapp/page-mixer/components/deposit/SubmitDeposit';
import { BalanceInputValue } from '@webb-dapp/react-components';
import AmountInput from '@webb-dapp/react-components/AmountInput/AmountInput';
import { TokenInput } from '@webb-dapp/react-components/TokenInput';
import { useApi, useConstants, useMixerInfos, useMixerProvider } from '@webb-dapp/react-hooks';
import { useInputValue } from '@webb-dapp/react-hooks/useInputValue';
import { isSupportedCurrency } from '@webb-dapp/react-hooks/utils/isSupportedCurrency';
import { Col, Row, SpaceBox } from '@webb-dapp/ui-components';
import { LoggerService } from '@webb-tools/app-util';
import { Token, token2CurrencyId } from '@webb-tools/sdk-core';
import { Asset } from '@webb-tools/sdk-mixer';
import { Balance, CurrencyId } from '@webb-tools/types/interfaces';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { CardRoot, CardSubTitle, CardTitle, DepositTitle, TriggerDeposit } from '../common';

type Item = {
  id: number;
  amount: Balance;
};
const depositLogger = LoggerService.get('Deposit');
export const DepositConsole: FC = () => {
  const { api } = useApi();
  const mixerInfos = useMixerInfos();
  const [token, setToken, { error: tokenError }] = useInputValue<BalanceInputValue>({
    amount: 0,
    token: token2CurrencyId(
      api,
      new Token({ amount: 0, chain: 'edgeware', name: 'EDG', precision: 12, symbol: 'EDG' })
    ),
  });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const clearAmount = useCallback(() => {
    setToken({
      amount: 0,
      token: token.token,
    });
  }, [token, setToken]);

  const handleSuccess = useCallback((): void => clearAmount(), [clearAmount]);

  const isDisabled = useMemo(() => {
    if (typeof token.amount === 'undefined') return true;
    if (tokenError) return true;

    return false;
  }, [token, tokenError]);

  const { allCurrencies } = useConstants();
  const supportedCurrencies = useMemo(() => allCurrencies.filter(isSupportedCurrency), [allCurrencies]);
  const handleTokenCurrencyChange = useCallback(
    (currency: CurrencyId) => {
      setToken({ token: currency });
      clearAmount();
    },
    [setToken, clearAmount]
  );
  const items = useMemo(() => {
    const items = mixerInfos
      .map((info) => {
        console.log(Number(info[1]['fixed_deposit_size']));
        console.log(info[0].toHuman()[0], 'mixer id');
        return {
          amount: info[1]['fixed_deposit_size'],
          // TODO: Make this more clearer, this is a number for the GroupId
          // but we should ensure that we have classes implementing these types
          // so that we can marshall properly
          id: Number(info[0].toHuman()[0]),
        };
      })
      .sort((a, b) => a.amount - b.amount);
    depositLogger.info(`items`, items);
    return items;
  }, [mixerInfos]);
  const [item, setItem] = useState<Item | undefined>(undefined);
  const { init, loading, mixer } = useMixerProvider();
  useEffect(() => {
    init();
  }, [init]);

  const params = useCallback(async () => {
    // ensure that this must be checked by isDisabled
    if (!token.token || typeof token.amount === 'undefined') return [];
    if (!item) {
      return [];
    }
    const selectedGroup = mixerInfos.find((g) => {
      const number = g[1]['fixed_deposit_size'];
      return number.toString() === item.amount.toString();
    });
    // @ts-ignore
    const groupId = Number(selectedGroup?.[0].toHuman()?.[0]);
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
  }, [token, item, mixerInfos, mixer]);

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
          <TokenInput currencies={supportedCurrencies} onChange={handleTokenCurrencyChange} value={token.token} />
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
