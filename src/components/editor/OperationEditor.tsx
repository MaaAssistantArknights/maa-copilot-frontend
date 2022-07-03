import { InputGroup } from '@blueprintjs/core';
import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormField } from 'src/components/FormField';
export const OperationEditor: FC<{
  operation?: CopilotDocV1.Operation
}> = ({
  operation
}) => {
  console.log(operation)
  const { control, watch, register } = useForm<CopilotDocV1.Operation>({
    defaultValues: operation,
  });

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log(value, name, type)
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <section className='p-4'>
      Editor
      {/* <InputGroup type="text" {...register("stageName")} /> */}
      <FormField label="Stage Name" field="stageName" control={control} ControllerProps={{
        render: ({ field, }) => (
          <InputGroup
            id="stageName"
            placeholder="Stage Name"
            {...field}
          />
        ),
      }} />
    </section>
  );
}
