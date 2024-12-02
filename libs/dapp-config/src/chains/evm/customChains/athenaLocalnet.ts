import { EVMChainId } from '@webb-tools/dapp-types/ChainId';
import { defineChain } from 'viem';

import { DEFAULT_EVM_CURRENCY } from '../../../constants';

const localOrbitMulticall3Address =
  process.env.BRIDGE_DAPP_LOCAL_ORBIT_MULTICALL3_ADDRESS;

const localAthenaMulticall3DeploymentBlock = process.env
  .BRIDGE_DAPP_LOCAL_ATHENA_MULTICALL3_DEPLOYMENT_BLOCK
  ? parseInt(process.env.BRIDGE_DAPP_LOCAL_ATHENA_MULTICALL3_DEPLOYMENT_BLOCK)
  : 0;

const athenaLocalnet = defineChain({
  id: EVMChainId.AthenaLocalnet,
  name: 'Athena',
  nativeCurrency: DEFAULT_EVM_CURRENCY,
  rpcUrls: {
    default: {
      http: [`http://127.0.0.1:5005`],
    },
  },
  ...(localOrbitMulticall3Address
    ? {
        contracts: {
          multicall3: {
            address: `0x${localOrbitMulticall3Address.replace(/^0x/, '')}`,
            blockCreated: localAthenaMulticall3DeploymentBlock,
          },
        },
      }
    : {}),
});

export default athenaLocalnet;
