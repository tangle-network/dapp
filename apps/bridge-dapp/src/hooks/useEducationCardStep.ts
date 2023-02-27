import { BehaviorSubject } from 'rxjs';
import { useObservableState } from 'observable-hooks';

type UseEducationCardStepReturnType = {
  educationCardStep: number;
  setEducationCardStep: (step: number) => void;
};

const defaultStep = 0;

const step$ = new BehaviorSubject(defaultStep);

const setEducationCardStep = (step: number) => step$.next(step);

export const useEducationCardStep = (): UseEducationCardStepReturnType => {
  const step = useObservableState(step$, defaultStep);

  return { educationCardStep: step, setEducationCardStep };
};
