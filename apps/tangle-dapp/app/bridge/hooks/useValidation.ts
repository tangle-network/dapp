// 'use client';

// import { useWebContext } from '@webb-tools/api-provider-environment';
// import { useMemo } from 'react';

// import { useBridge } from '../../../context/BridgeContext';
// import { isEVMChain, isSubstrateChain } from '../../../utils/bridge';
// import useBalance from './useBalance';
// import useMinAmount from './useMinAmount';

// type BridgeError =
//   | 'WrongWalletEvm'
//   | 'WrongWalletSubstrate'
//   | 'InsufficientBalance'
//   | 'AmountTooSmall'
//   | 'AmountEmpty';

// export default function useValidation() {
//   const { activeWallet } = useWebContext();
//   const { selectedSourceChain, amount } = useBridge();
//   const { balance, isLoading: isLoadingBalance } = useBalance();
//   const minAmount = useMinAmount();

//   const error = useMemo<BridgeError | null>(() => {
//     if (
//       activeWallet?.platform === 'Substrate' &&
//       isEVMChain(selectedSourceChain)
//     ) {
//       return 'WrongWalletEvm';
//     }

//     if (
//       activeWallet?.platform === 'EVM' &&
//       isSubstrateChain(selectedSourceChain)
//     ) {
//       return 'WrongWalletSubstrate';
//     }

//     if (!amount) return 'AmountEmpty';

//     // compare amount and balance
//     if (minAmount) return null;

//   }, [activeWallet?.platform, selectedSourceChain]);
// }
