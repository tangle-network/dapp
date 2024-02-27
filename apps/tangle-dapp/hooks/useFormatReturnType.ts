const useFormatReturnType = <
  DataType = unknown,
  ErrorType extends Error | unknown = unknown
>({
  data = null,
  isLoading,
  error = null,
}: {
  isLoading: boolean;
  error: ErrorType | null;
  data: DataType | null;
}) => {
  if (isLoading) {
    return {
      isLoading,
      error: null,
      data: null,
    };
  }

  if (error) {
    return {
      isLoading,
      error,
      data: null,
    };
  }

  return {
    isLoading,
    error: null,
    data,
  };
};

export default useFormatReturnType;
