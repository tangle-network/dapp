import { BalanceInputValue } from '@webb-dapp/react-components';
import AmountInput from '@webb-dapp/react-components/AmountInput/AmountInput';
import { TokenInput } from '@webb-dapp/react-components/TokenInput';
import { useApi, useConstants, useMixerInfos, useMixerProvider } from '@webb-dapp/react-hooks';
import { useInputValue } from '@webb-dapp/react-hooks/useInputValue';
import { isSupportedCurrency } from '@webb-dapp/react-hooks/utils/isSupportedCurrency';
import { Col, Row, SpaceBox } from '@webb-dapp/ui-components';
import { LoggerService } from '@webb-tools/app-util';
import { Token, token2CurrencyId } from '@webb-tools/sdk-core';
import { CurrencyId } from '@webb-tools/types/interfaces';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { CardRoot, CardSubTitle, CardTitle, CTxButton, DepositTitle } from '../common';
import { Asset } from '@webb-tools/sdk-mixer';

const depositLogger = LoggerService.get('Deposit');
export const DepositConsole: FC = () => {
  const { api } = useApi();
  const mixerInfos = useMixerInfos();
  const [token, setToken, { error: tokenError }] = useInputValue<BalanceInputValue>({
    amount: 0,
    token: token2CurrencyId(
      api,
      new Token({ amount: 0, chain: 'edgeware', name: 'EDG', precision: 18, symbol: 'EDG' })
    ),
  });

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
    const items = mixerInfos.map((info) => {
      return {
        amount: Number(info[1]['fixed_deposit_size']),
        // TODO: Make this more clearer, this is a number for the GroupId
        // but we should ensure that we have classes implementing these types
        // so that we can marshall properly
        id: Number(info[0].toHuman()[0]),
      };
    });
    depositLogger.info(`items`, items);
    return items;
  }, [mixerInfos]);
  const [item, setItem] = useState<any>(undefined);
  const { init, initialized, mixer, loading } = useMixerProvider();
  useEffect(() => {
    init();
  }, []);
  const params = useCallback(async () => {
    // ensure that this must be checked by isDisabled
    if (!token.token || typeof token.amount === 'undefined') return [];
    let groupId = mixerInfos.find((g) => {
      const number = g[1]['fixed_deposit_size'].toNumber();
      return number === item.amount;
    });

    let noteCommitment = null;
    if (!mixer) {
      depositLogger.warn(`Mixer isn't instilled yet`);
      return [groupId, noteCommitment];
    }
    // todo make toke symbol configurable
    const note = await mixer.generateNote(new Asset(0, 'EDG'));
    return new Promise<any[]>((resolve, reject) => {
      mixer
        .deposit(note, (leaf) => {
          depositLogger.trace('generated note ', note.serialize());
          depositLogger.info(`Getting params GroupID `, 0);
          depositLogger.info(`Full params are groupId, noteCommitment]`, [0, [leaf]]);
          resolve([0, [leaf]]);
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
          <CTxButton
            disabled={isDisabled}
            loading={loading}
            method='deposit'
            onInblock={handleSuccess}
            params={params}
            section='mixer'
            size='large'
          >
            Deposit
          </CTxButton>
        </Col>
      </Row>
    </CardRoot>
  );
};
