// import { useEffect, useState } from 'react';

// import {
//   LiquidStakingChain,
//   LS_CHAIN_TO_LOCAL_RPC_ENDPOINT,
// } from '../../constants/liquidStaking';
// import { Validator } from '../../types/liquidStaking';
// import { getAccountInfo, getApiPromise } from '../../utils/polkadot';
// import { useLiquidStakingStore } from './store';

// const useValidators = (): {
//   isLoading: boolean;
//   data: Validator[];
// } => {
//   const { selectedChain } = useLiquidStakingStore();
//   const [isLoading] = useState(false);
//   const [Validators, setValidators] = useState<Validator[]>([]);

//   useEffect(() => {
//     console.debug('Fetching Validators for chain:', selectedChain);

//     fetchValidators(selectedChain).then((validators) => {
//       console.debug('Validators:', validators);
//       setValidators(validators);
//     });
//   }, [selectedChain]);

//   return {
//     isLoading,
//     data: Validators,
//   };
// };

// export default useValidators;

// async function fetchValidators(
//   chain: LiquidStakingChain,
// ): Promise<Validator[]> {
//   const rpcEndpoint = LS_CHAIN_TO_LOCAL_RPC_ENDPOINT[chain];

//   if (!rpcEndpoint) {
//     return [];
//   }

//   const api = await getApiPromise(rpcEndpoint);

//   const validators = await api.query.session.validators();

//   const mappedIdentity = new Map<string, string>();

//   validators.map(async (val) => {
//     const valAddress = val.toString();
//     const accountInfo = await getAccountInfo(rpcEndpoint, valAddress);

//     if (accountInfo?.name) {
//       mappedIdentity.set(valAddress, accountInfo.name);
//     } else {
//       mappedIdentity.set(valAddress, valAddress);
//     }
//   });

//   return validators.map((val, _) => {
//     const validatorId = val.toString();
//     const identity = mappedIdentity.get(validatorId) || validatorId;

//     return {
//       address: validatorId,
//       identity: identity.toString(),
//       totalValueStaked: 0,
//       annualPercentageYield: 0,
//     };
//   });
// }
