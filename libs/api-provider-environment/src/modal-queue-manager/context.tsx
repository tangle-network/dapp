'use client';

import type { DialogProps } from '@radix-ui/react-dialog';
import noop from 'lodash/noop';
import { createContext } from 'react';

type ModalQueueItem = React.ReactElement<DialogProps>;

type ModalQueueManagerContextType = {
  queue: Array<ModalQueueItem>;
  enqueue: (modal: ModalQueueItem) => void;
  dequeue: () => ModalQueueItem | undefined;
};

/**
 * ModalQueueManagerContext is a context that provides a queue of modals
 */
const ModalQueueManagerContext = createContext<ModalQueueManagerContextType>({
  queue: [],
  enqueue: noop,
  dequeue: () => undefined,
});

export default ModalQueueManagerContext;

export type { ModalQueueItem, ModalQueueManagerContextType };
