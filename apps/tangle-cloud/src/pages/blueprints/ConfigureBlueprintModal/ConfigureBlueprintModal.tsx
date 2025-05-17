import { zodResolver } from '@hookform/resolvers/zod';
import { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { Form } from '@tangle-network/ui-components/components/form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@tangle-network/ui-components/components/form';
import { Input } from '@tangle-network/ui-components';
import {
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@tangle-network/ui-components/components/Modal';
import { FC, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  blueprintFormSchema,
  BlueprintFormSchema,
  BlueprintFormResult,
} from './types';
import FormActions from './FormActions';

type Props = {
  onOpenChange: (isOpen: boolean) => void;
  blueprints: Blueprint[];
  onSubmit: (result: BlueprintFormResult) => void;
};

const ConfigureBlueprintModal: FC<Props> = ({
  onOpenChange,
  blueprints,
  onSubmit,
}) => {
  const form = useForm<BlueprintFormSchema>({
    resolver: zodResolver(blueprintFormSchema),
    defaultValues: {
      rpcUrl: '',
    },
  });

  const handleClose = useCallback(() => {
    onOpenChange(false);
    form.reset();
  }, [form, onOpenChange]);

  const handleSubmit = useCallback(
    (values: BlueprintFormSchema) => {
      handleClose();
      onSubmit({
        values,
      });
    },
    [handleClose, onSubmit],
  );

  return (
    <ModalContent
      size="md"
      onInteractOutside={(event) => event.preventDefault()}
      title="Configure Blueprint"
      description={`Configure the RPC URL for ${blueprints.length} selected blueprint${blueprints.length > 1 ? 's' : ''}`}
    >
      <ModalHeader onClose={handleClose} className="pb-4">
        Configure Blueprint{blueprints.length > 1 ? 's' : ''}
      </ModalHeader>

      <ModalBody className="p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {blueprints.length > 1 ? (
              <div className="space-y-4">
                <p className="text-mono-120 dark:text-mono-100">
                  The following blueprints will be configured with the same RPC
                  URL:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  {blueprints.map((blueprint) => (
                    <li
                      key={blueprint.id}
                      className="text-mono-120 dark:text-mono-100"
                    >
                      {blueprint.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="rpcUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter RPC URL</FormLabel>
                  <FormControl>
                    <Input
                      id="rpc-url-input"
                      placeholder="https://rpc.example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormActions />
          </form>
        </Form>
      </ModalBody>
    </ModalContent>
  );
};

export default ConfigureBlueprintModal;
