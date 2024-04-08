import React, {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from 'react';

const ErrorSetContext = React.createContext<{
  errors: Set<string>;
  setErrors: Dispatch<SetStateAction<Set<string>>>;
}>({
  errors: new Set(),
  setErrors: () => {
    //
  },
});

export const ErrorSetContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [errorSet, setErrorSet] = useState(new Set<string>());

  return (
    <ErrorSetContext.Provider
      value={{ errors: errorSet, setErrors: setErrorSet }}
    >
      {children}
    </ErrorSetContext.Provider>
  );
};

/**
 * Useful for inputs of a form or any other component that
 * needs to keep track of the number of errors that are currently
 * present, but that may be deeply nested in the component tree,
 * and would be impractical to pass the error count down through props.
 */
export const useErrorCountContext = () => {
  const { errors, setErrors } = useContext(ErrorSetContext);

  const addError = useCallback(
    (error: string) => {
      setErrors((prevErrors) => new Set([...prevErrors, error]));
    },
    [setErrors]
  );

  const removeError = useCallback(
    (error: string) => {
      setErrors((prevErrors) => {
        const newErrors = new Set(prevErrors);

        newErrors.delete(error);

        return newErrors;
      });
    },
    [setErrors]
  );

  const clearErrors = useCallback(() => {
    setErrors(new Set());
  }, [setErrors]);

  return { errors, addError, removeError, clearErrors };
};
