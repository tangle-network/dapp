import { useCallback } from 'react';
import { FieldValues, Path, PathValue, UseFormSetValue } from 'react-hook-form';

/**
 * A wrapper around react-hook-form's setValue that automatically sets
 * `shouldDirty` and `shouldValidate` to true for better UX.
 *
 * Usage:
 * ```tsx
 * const { setValue: setFormValue } = useForm<MyFormFields>();
 * const setValue = useFormSetValue(setFormValue);
 * ```
 */
const useFormSetValue = <TFieldValues extends FieldValues>(
  setFormValue: UseFormSetValue<TFieldValues>,
) => {
  return useCallback(
    <TFieldName extends Path<TFieldValues>>(
      name: TFieldName,
      value: PathValue<TFieldValues, TFieldName>,
      options?: Parameters<UseFormSetValue<TFieldValues>>[2],
    ) => {
      setFormValue(name, value, {
        shouldDirty: true,
        shouldValidate: true,
        ...options,
      });
    },
    [setFormValue],
  );
};

export default useFormSetValue;
