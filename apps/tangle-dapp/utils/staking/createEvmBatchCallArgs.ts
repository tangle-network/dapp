import {
  AbiBatchCallArgs,
  AbiBatchCallData,
} from '../../hooks/useEvmPrecompileAbiCall';

function createEvmBatchCallArgs(
  callData: AbiBatchCallData[]
): AbiBatchCallArgs {
  return [
    callData.map((call) => call.to),
    callData.map((call) => call.value),
    callData.map((call) => call.callData),
    callData.map((call) => call.gasLimit),
  ];
}

export default createEvmBatchCallArgs;
