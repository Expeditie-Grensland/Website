import { ComponentChildren, FunctionComponent } from "preact";
import { getAllExpedities } from "../../db/expeditie.js";
import { getAllPersons } from "../../db/person.js";
import { getISODate } from "../../helpers/time.js";

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

export const CheckInput: FunctionComponent<BasicInput<boolean>> = ({
  value,
  ...rest
}) => (
  <div class="form-check">
    <input type="checkbox" class="form-check-input" checked={value} {...rest} />
  </div>
);

export const DateInput: FunctionComponent<BasicInput<Date>> = ({
  placeholder = "Datum",
  value,
  ...rest
}) => (
  <input
    type="date"
    pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
    class="form-control"
    placeholder={placeholder}
    value={value?.toISOString().slice(0, 10)}
    {...rest}
  />
);

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

type BasicSelector = BasicInput<string | null> & { allowEmpty?: boolean };

const Selector = <T extends { id: string }>({
  placeholder,
  options,
  optionText,
  value: value,
  allowEmpty,
  ...rest
}: {
  placeholder: string;
  options: T[];
  optionText: (option: T) => string;
} & BasicSelector) => (
  <select class="form-select" required {...rest}>
    <option selected={value === undefined} disabled>
      {placeholder}
    </option>
    {allowEmpty && (
      <option selected={value === null} value="-">
        Geen
      </option>
    )}
    {options.map((option) => (
      <option selected={value === option.id} value={option.id}>
        {optionText(option)}
      </option>
    ))}
  </select>
);

export const ExpeditieInput: FunctionComponent<
  {
    expedities: Awaited<ReturnType<typeof getAllExpedities>>;
  } & BasicSelector
> = ({ expedities, placeholder = "Expeditie", ...rest }) => (
  <Selector
    placeholder={placeholder}
    options={expedities}
    optionText={(expeditie) => expeditie.name}
    {...rest}
  />
);

export const PersonInput: FunctionComponent<
  {
    persons: Awaited<ReturnType<typeof getAllPersons>>;
  } & BasicSelector
> = ({ persons, placeholder = "Persoon", ...rest }) => (
  <Selector
    placeholder={placeholder}
    options={persons}
    optionText={(person) => `${person.first_name} ${person.last_name}`}
    {...rest}
  />
);

export const TeamInput: FunctionComponent<
  { teams: ("r" | "g" | "b")[] } & BasicSelector
> = ({ teams = ["r", "g", "b"], placeholder = "Team", ...rest }) => (
  <Selector
    placeholder={placeholder}
    options={(
      [
        { id: "r", name: "Rood" },
        { id: "b", name: "Blauw" },
        { id: "g", name: "Groen" },
      ] as const
    ).filter((team) => teams.includes(team.id))}
    optionText={(team) => team.name}
    {...rest}
  />
);

export const TimezoneInput: FunctionComponent<BasicInput<string>> = ({
  placeholder = "Tijdzone",
  value = "Europe/Amsterdam",
  ...rest
}) => (
  <Selector
    placeholder={placeholder}
    options={Intl.supportedValuesOf("timeZone").map((zone) => ({ id: zone }))}
    optionText={({ id }) => id}
    value={value}
    {...rest}
  />
);

type FormInputArrayProps<Value> = {
  values?: Value[];
  allowEmpty?: boolean;

  children: (
    value: Value | undefined,

    inputAttributes: { disabled?: boolean; form?: string }
  ) => ComponentChildren;

  form?: string;
};

export const FormInputArray = <Value,>({
  values = [],
  allowEmpty,
  children,
  ...attrs
}: FormInputArrayProps<Value>) => (
  <div class={allowEmpty ? "form-array form-array-allow-empty" : "form-array"}>
    {(values.length == 0 && !allowEmpty ? [undefined] : values).map((value) => (
      <div class="form-array-item">{children(value, attrs)}</div>
    ))}

    <div class="form-array-proto" hidden>
      {children(undefined, { disabled: true, ...attrs })}
    </div>

    <button class="form-array-add btn btn-secondary me-2">+</button>
    <button
      class="form-array-remove btn btn-secondary"
      disabled={values.length == 0 || (!allowEmpty && values.length == 1)}
    >
      –
    </button>
  </div>
);
