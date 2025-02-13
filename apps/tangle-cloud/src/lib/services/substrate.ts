import { ApiPromise } from '@polkadot/api';
import { Signer } from '@polkadot/api/types';
import BaseServices, { EventHandlers, RegisterArgs } from './base';

export class SubstrateServices implements BaseServices {
  constructor(
    private readonly address: string,
    private readonly signer: Signer,
    private readonly api: ApiPromise,
  ) {}

  validateRegisterArgs() {
    // TODO: Implement validation
  }

  async register(args: RegisterArgs, eventHandlers: EventHandlers) {
    try {
      eventHandlers?.onRegister?.onTxSending?.();

      // TODO: Implement Substrate registration logic

      eventHandlers?.onRegister?.onTxSuccess?.();
    } catch (error) {
      eventHandlers?.onRegister?.onTxFailed?.(
        error instanceof Error ? error.message : 'Unknown error',
        args,
      );
    }
  }
}
