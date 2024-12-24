import { FunctionComponent } from "preact";
import { getISODate } from "../../../helpers/time.js";

type BasicInput<Value> = {
  name: string;
  form?: string;
  required?: boolean;
  placeholder?: string;
  value?: Value | undefined;
  hidden?: boolean;
  disabled?: boolean;
};

export const TextInput: FunctionComponent<BasicInput<string>> = ({
  ...rest
}) => <input type="text" class="form-control" {...rest} />;

export const TextAreaInput: FunctionComponent<BasicInput<string>> = ({
  value,
  ...rest
}) => (
  <textarea class="form-control" {...rest}>
    {value}
  </textarea>
);

export const NumberInput: FunctionComponent<BasicInput<number>> = ({
  ...rest
}) => <input type="number" class="form-control" {...rest} />;

export const FileInput: FunctionComponent<
  BasicInput<undefined> & {
    accept?: string;
    multiple?: boolean;
  }
> = ({ ...rest }) => <input type="file" class="form-control" {...rest} />;

export const HiddenInput: FunctionComponent<BasicInput<string | number>> = ({
  ...rest
}) => <input type="hidden" {...rest} />;

export const LocalTimeInput: FunctionComponent<
  BasicInput<{
    stamp: number;
    zone: string;
  }>
> = ({ placeholder = "Lokale tijd", value, ...rest }) => (
  <input
    type="datetime-local"
    pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}([0-9]{2})?"
    step={1}
    class="form-control"
    placeholder={placeholder}
    value={value && getISODate(value.stamp, value.zone)}
    {...rest}
  />
);

export const TimezoneInput: FunctionComponent<BasicInput<string>> = ({
  placeholder = "Tijdzone",
  value = "Europe/Amsterdam",
  ...rest
}) => (
  <input
    type="text"
    class="form-control"
    placeholder={placeholder}
    value={value}
    {...rest}
  />
);
