import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import { AbiBatchCall } from '../../hooks/useEvmPrecompileCall';
import { Hex } from 'viem';

type AbiBatchCallArgs = [EvmAddress[], bigint[], Hex[], bigint[]];

function createEvmBatchCallArgs(callData: AbiBatchCall[]): AbiBatchCallArgs {
  return [
    callData.map((call) => call.to),
    callData.map((call) => BigInt(call.value)),
    callData.map((call) => call.callData),
    callData.map((call) => BigInt(call.gasLimit)),
  ];
}

export default createEvmBatchCallArgs;
