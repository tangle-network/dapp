import { Label, Input } from "@tangle-network/ui-components"
import InstanceHeader from "../../../../../components/InstanceHeader"
import ErrorMessage from "../../../../../components/ErrorMessage"
import { FC } from "react"
import { DeployStep1Props } from "./type"

export const DeployStep1: FC<DeployStep1Props> = ({
  errors
}) => {
  const labelClassName = 'text-mono-200 dark:text-mono-0';

  return (
    <div className="w-full pl-8">
      <InstanceHeader title="DFNS CGGMP21" creator="Tangle Network" />

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <Label className={labelClassName}>Instance Name:</Label>
          <Input
            id={`instanceName`}
            isControlled
            inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
            placeholder="Enter instance name"
            autoComplete="off"
          />
          {errors && errors['instanceName'] && (
            <ErrorMessage>{errors['instanceName']}</ErrorMessage>
          )}
        </div>

        <div>
          <Label className={labelClassName}>Instance Duration:</Label>
          <Input
            id={`instanceDuration`}
            isControlled
            inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
            placeholder="Enter instance duration"
            autoComplete="off"
            type="number"
            min={1}
          />
          {errors && errors['instanceDuration'] && (
            <ErrorMessage>{errors['instanceDuration']}</ErrorMessage>
          )}
        </div>

        <div>
          <Label className={labelClassName}>Permitted Caller(s):</Label>
          <Input
            id={`permittedCallers`}
            isControlled
            inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
            placeholder="Enter permitted callers"
            autoComplete="off"
            type="number"
            min={1}
          />
          {errors && errors['permittedCallers'] && (
            <ErrorMessage>{errors['permittedCallers']}</ErrorMessage>
          )}
        </div>
      </div>
    </div>
  )
}
