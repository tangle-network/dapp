import { useCallback } from 'react';

interface UseActionProps {
  isDisabled?: boolean;
  onClick?: () => void;
}

export const useAction = ({ isDisabled, onClick }: UseActionProps) => {
  return useCallback(() => {
    if (isDisabled || !onClick) {
      return;
    }
    onClick();
  }, [isDisabled, onClick]);
};
