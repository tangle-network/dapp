import { useCallback, useContext } from 'react';
import ErrorSetContext from './ErrorsContext';

/**
 * Useful for inputs of a form or any other component that
 * needs to keep track of the number of errors that are currently
 * present, but that may be deeply nested in the component tree,
 * and would be impractical to pass the error count down through props.
 */
const useErrorCountContext = () => {
  const { errors, setErrors } = useContext(ErrorSetContext);

  const addError = useCallback(
    (error: string) => {
      setErrors((prevErrors) => new Set([...prevErrors, error]));
    },
    [setErrors],
  );

  const removeError = useCallback(
    (error: string) => {
      setErrors((prevErrors) => {
        const newErrors = new Set(prevErrors);

        newErrors.delete(error);

        return newErrors;
      });
    },
    [setErrors],
  );

  const clearErrors = useCallback(() => {
    setErrors(new Set());
  }, [setErrors]);

  return { errors, addError, removeError, clearErrors };
};

export default useErrorCountContext;
