import { bool } from '@polkadot/types';
import { useCall } from './useCall';

interface EmergencyShutdownData {
  canRefund: boolean;
  isShutdown: boolean;
}

export function useEmergencyShutdown(): EmergencyShutdownData {
  const _isShutdown = useCall<bool>('query.emergencyShutdown.isShutdown', []);
  const _canRefund = useCall<bool>('query.emergencyShutdown.canRefund', []);

  return {
    canRefund: _canRefund ? _canRefund.isTrue : false,
    isShutdown: _isShutdown ? _isShutdown.isTrue : false,
  };
}
