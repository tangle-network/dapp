import {
  AbiBatchCallArgs,
  AbiBatchCallData,
} from '../../hooks/useEvmPrecompileAbiCall';

function createEvmBatchCallArgs(
  callData: AbiBatchCallData[],
): AbiBatchCallArgs {
  return [
    callData.map((call) => call.to),
    callData.map((call) => BigInt(call.value)),
    callData.map((call) => call.callData),
    callData.map((call) => BigInt(call.gasLimit)),
  ];
}

export default createEvmBatchCallArgs;
