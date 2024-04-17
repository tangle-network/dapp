import {
  EvmAbiBatchCallArgs,
  EvmBatchCallData,
} from '../../hooks/useEvmPrecompileAbiCall';

function createEvmBatchCallArgs(
  callData: EvmBatchCallData[]
): EvmAbiBatchCallArgs {
  return [
    callData.map((call) => call.to),
    callData.map((call) => call.value),
    callData.map((call) => call.callData),
    callData.map((call) => call.gasLimit),
  ];
}

export default createEvmBatchCallArgs;
