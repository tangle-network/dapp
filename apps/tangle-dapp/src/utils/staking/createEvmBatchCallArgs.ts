import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { AbiBatchCall } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { Hex } from 'viem';

type AbiBatchCallArgs = [EvmAddress[], bigint[], Hex[], bigint[]];

function createEvmBatchCallArgs(calls: AbiBatchCall[]): AbiBatchCallArgs {
  return [
    calls.map((call) => call.to),
    calls.map((call) => BigInt(call.value)),
    calls.map((call) => call.callData),
    calls.map((call) => BigInt(call.gasLimit)),
  ];
}

export default createEvmBatchCallArgs;
