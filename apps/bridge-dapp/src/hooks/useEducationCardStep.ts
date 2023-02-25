import { BehaviorSubject } from 'rxjs';
import { useObservableState } from 'observable-hooks';

type UseEducationCardStepReturnType = {
  step: number;
  setStep: (step: number) => void;
};

const defaultStep = 0;

const step$ = new BehaviorSubject(defaultStep);

const setStep = (step: number) => step$.next(step);

export const useEducationCardStep = (): UseEducationCardStepReturnType => {
  const step = useObservableState(step$, defaultStep);

  return { step, setStep };
};
