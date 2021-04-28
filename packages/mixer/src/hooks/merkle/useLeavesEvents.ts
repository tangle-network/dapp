import { useApi, useCall } from '@webb-dapp/react-hooks';
import { LoggerService } from '@webb-tools/app-util';
import { Block, BlockNumber } from '@webb-tools/types/interfaces';
import { useEffect, useState } from 'react';

import { Vec } from '@polkadot/types';
import { EventRecord } from '@polkadot/types/interfaces';

const logger = LoggerService.get('useLeavesEvents');

export const useLeavesEvents = () => {
  const [pagination, setPagination] = useState({
    blockNumber: 0,
    done: false,
  });
  const { api } = useApi();
  const [treeLeaves, setTreeLeaves] = useState<Array<Uint8Array>>([]);

  const blockNumber = useCall<Block>('query.system.number', []);

  useEffect(() => {
    logger.info('calling hook');
    const call = async () => {
      const latestBlockNumber = await api.query.system.number().toPromise();
      let startingBlock = 0;
      logger.error('latestBlockNumber', { latestBlockNumber });
      for (;;) {
        const block = await api.query.system.number(startingBlock).toPromise();
        if (block.hash === latestBlockNumber.hash) {
          break;
        }
        const events = await api.query.system.events.at<Vec<EventRecord>>(block.hash).toPromise();
        for (const { event } of events) {
          if (event.data.section.toString() === 'merkle' && event.method === 'newMember') {
            logger.error('event', event);
          }
        }
        startingBlock++;
      }
    };
    call().catch((e) => {
      logger.log(e, 'useLeavesEvents');
    });
  }, [api.query.system]);

  return {
    data: treeLeaves,
    done: pagination.done,
  };
};
