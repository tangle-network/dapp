import React, { FC, useEffect } from 'react';
import { isEmpty } from 'lodash';

import { Vec } from '@polkadot/types';
import { EventRecord } from '@polkadot/types/interfaces';

import { useApi, useAccounts } from '@webb-dapp/react-hooks';
import { notification } from '@webb-dapp/ui-components';
import { getTokenName, formatHash, formatNumber } from './utils';
import { FixedPointNumber } from '@webb-tools/sdk-core';

interface HandlerConfig {
  section: string;
  method: string;
  handler: (item: EventRecord) => void;
}

type HandlerConfigHashMap = {
  [k in string]: HandlerConfig['handler'];
};

function handler(config: HandlerConfig[]): (list: EventRecord[]) => void {
  const dispatcherHashMap: HandlerConfigHashMap = config.reduce((hashMap, item) => {
    hashMap[`${item.section}_${item.method}`] = item.handler;

    return hashMap;
  }, {} as HandlerConfigHashMap);

  return (list: EventRecord[]): void => {
    list.forEach((item) => {
      const key = `${item.event.section.toString()}_${item.event.method.toString()}`;
      const handler = dispatcherHashMap[key];

      if (handler) {
        handler(item);
      }
    });
  };
}

export const EventsWatcher: FC = () => {
  const { api } = useApi();
  const { active } = useAccounts();

  useEffect(() => {
    if (isEmpty(api) || !active) return;

    const subscriber = api.query.system.events<Vec<EventRecord>>().subscribe({
      next: (events: Vec<EventRecord>): void => {
        handler([
          // handle currency transfer event
          {
            handler: (event): void => {
              const data = (event.event.data.toJSON() as unknown) as [
                { Token?: string; DEXShare: [string, string] },
                string,
                string,
                string
              ]; // [ASSET, ORIGIN, TARGET, AMOUNT]

              if (data[2] !== active?.address) return;

              const num = FixedPointNumber.fromInner(data[3]);

              if (num.isLessThan(new FixedPointNumber('0.0000001'))) return;

              notification.open({
                className: 'success',
                message: (
                  <div>
                    <p>{`Received ${formatNumber(num, {
                      decimalLength: 6,
                      removeEmptyDecimalParts: true,
                      removeTailZero: true
                    })} ${getTokenName(data[0].Token || data[0].DEXShare)}`}</p>
                    <p>{`From ${formatHash(data[1])}`}</p>
                  </div>
                )
              });
            },
            method: 'Transferred',
            section: 'currencies'
          },
          // handle currency deposit event
          {
            handler: (event): void => {
              const data = (event.event.data.toJSON() as unknown) as [
                { Token?: string; DEXShare: [string, string] },
                string,
                string
              ]; // [ASSET, TARGET, AMOUNT]

              if (data[1] !== active?.address) return;

              const num = FixedPointNumber.fromInner(data[2]);

              if (num.isLessThan(new FixedPointNumber('0.0000001'))) return;

              notification.open({
                className: 'success',
                message: (
                  <div>
                    <p>{`Received ${formatNumber(num, {
                      decimalLength: 6,
                      removeEmptyDecimalParts: true,
                      removeTailZero: true
                    })} ${getTokenName(data[0].Token || data[0].DEXShare)}`}</p>
                  </div>
                )
              });
            },
            method: 'Deposited',
            section: 'currencies'
          },
          // handle cdp liquidate
          {
            handler: (event): void => {
              const data = (event.event.data.toJSON() as unknown) as [string, string, string, string, string]; // [CURRENCY, ACCOUNT, Balance, Balnace, LiquidationStrategy]

              if (data[1] !== active?.address) return;

              notification.open({
                className: 'error',
                message: (
                  <div>
                    <p>{`The ${getTokenName(data[0])} Loan had been liquidated.`}</p>
                  </div>
                )
              });
            },
            method: 'LiquidateUnsafeCDP',
            section: 'cdpEngine'
          }
        ])(events);
      }
    });

    return (): void => subscriber.unsubscribe();
  }, [api, active]);

  return <></>;
};
