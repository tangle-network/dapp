import { FieldPath, FieldValues } from 'react-hook-form';
type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
    name: TName;
};
declare const FormFieldContext: import('../../../../../node_modules/react').Context<FormFieldContextValue<FieldValues, string>>;
export default FormFieldContext;
