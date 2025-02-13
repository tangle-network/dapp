import { WagmiConfig } from '@webb-tools/dapp-config/wagmi-config';
import BaseServices, { EventHandlers, RegisterArgs } from './base';

export class EvmServices implements BaseServices {
  constructor(
    private readonly address: string,
    private readonly signer: string,
    private readonly config: WagmiConfig,
  ) {}

  validateRegisterArgs() {
    // TODO: Implement validation
  }

  async register(args: RegisterArgs, eventHandlers: EventHandlers) {
    try {
      eventHandlers?.onRegister?.onTxSending?.();

      // TODO: Implement EVM registration logic

      eventHandlers?.onRegister?.onTxSuccess?.();
    } catch (error) {
      eventHandlers?.onRegister?.onTxFailed?.(
        error instanceof Error ? error.message : 'Unknown error',
        args,
      );
    }
  }
}
