import { createContext, Dispatch, SetStateAction } from 'react';

const ErrorSetContext = createContext<{
  errors: Set<string>;
  setErrors: Dispatch<SetStateAction<Set<string>>>;
}>({
  errors: new Set(),
  setErrors: () => {
    //
  },
});

export default ErrorSetContext;
