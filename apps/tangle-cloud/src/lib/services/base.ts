import { TxEventHandlers } from '@webb-tools/abstract-api-provider';
import { PrimitiveField } from '@webb-tools/tangle-shared-ui/types/blueprint';
import assert from 'assert';

export type PreferenceType = {
  key: Uint8Array;
  priceTargets: {
    cpu: number;
    mem: number;
    storageHdd: number;
    storageSsd: number;
    storageNvme: number;
  };
};

export type RegisterArgsType = {
  blueprintIds: string[];
  preferences: PreferenceType[];
  registrationArgs: PrimitiveField[][];
  amount: string[];
};

abstract class BaseServices {
  validateRegisterArgs(args: RegisterArgsType): void | never {
    const { blueprintIds, preferences, registrationArgs, amount } = args;

    const blueprintLength = blueprintIds.length;

    assert(
      blueprintLength === preferences.length &&
        blueprintLength === registrationArgs.length &&
        blueprintLength === amount.length,
      'Invalid arguments',
    );
  }

  abstract register(
    args: RegisterArgsType,
    eventHandlers?: Partial<{
      onPreRegister: Partial<TxEventHandlers<RegisterArgsType>>;
      onRegister: Partial<TxEventHandlers<RegisterArgsType>>;
    }>,
  ): Promise<void>;
}

export default BaseServices;
