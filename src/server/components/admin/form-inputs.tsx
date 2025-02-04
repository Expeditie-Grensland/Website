import { ComponentChildren, FunctionComponent } from "preact";
import { getAllExpedities } from "../../db/expeditie.js";
import { getExpeditieSegments } from "../../db/geo.js";
import {
  getAllPersons,
  personTeamNames,
  personTypeNames,
} from "../../db/person.js";
import { PersonTeam, PersonType } from "../../db/schema/types.js";
import { getISODate } from "../../helpers/time.js";

type BasicInput<Value> = {
  name: string;
  form?: string;
  required?: boolean;
  placeholder?: string;
  value?: Value | undefined;
  hidden?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
};

export const TextInput: FunctionComponent<BasicInput<string>> = ({
  ...rest
}) => <input type="text" class="input" {...rest} />;

export const PasswordInput: FunctionComponent<BasicInput<string>> = ({
  ...rest
}) => <input type="password" class="input" {...rest} />;

export const TextAreaInput: FunctionComponent<BasicInput<string>> = ({
  value,
  ...rest
}) => (
  <textarea class="input" {...rest}>
    {value}
  </textarea>
);

export const NumberInput: FunctionComponent<BasicInput<number>> = ({
  ...rest
}) => <input type="number" class="input" {...rest} />;

export const EmailInput: FunctionComponent<BasicInput<string>> = ({
  ...rest
}) => <input type="email" class="input" {...rest} />;

export const FileInput: FunctionComponent<
  BasicInput<undefined> & {
    accept?: string;
    multiple?: boolean;
  }
> = ({ ...rest }) => <input type="file" class="input" {...rest} />;

export const HiddenInput: FunctionComponent<BasicInput<string | number>> = ({
  ...rest
}) => <input type="hidden" {...rest} />;

export const CheckInput: FunctionComponent<BasicInput<boolean>> = ({
  value,
  ...rest
}) => (
  <div>
    <input type="checkbox" class="input-check" checked={value} {...rest} />
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
    class="input"
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
    class="input"
    placeholder={placeholder}
    value={value && getISODate(value.stamp, value.zone)}
    {...rest}
  />
);

type BaseSelectorInput = BasicInput<string | null> & {
  allowEmpty?: boolean;
};

export const SelectorInput = ({
  placeholder,
  options,
  value,
  allowEmpty,
  ...rest
}: {
  placeholder: string;
  options: { id: string; text: string }[];
} & BaseSelectorInput) => (
  <select class="input" required {...rest}>
    <option selected={value === undefined} disabled value="">
      {placeholder}
    </option>
    {allowEmpty && (
      <option selected={value === null} value="-">
        Geen
      </option>
    )}
    {options.map((option) => (
      <option selected={value === option.id} value={option.id}>
        {option.text}
      </option>
    ))}
  </select>
);

export const ExpeditieInput: FunctionComponent<
  {
    expedities: Awaited<ReturnType<typeof getAllExpedities>>;
  } & BaseSelectorInput
> = ({ expedities, placeholder = "Expeditie", ...rest }) => (
  <SelectorInput
    placeholder={placeholder}
    options={expedities.map(({ id, name }) => ({ id, text: name }))}
    {...rest}
  />
);

export const PersonInput: FunctionComponent<
  {
    persons: Awaited<ReturnType<typeof getAllPersons>>;
  } & BaseSelectorInput
> = ({ persons, placeholder = "Persoon", ...rest }) => (
  <SelectorInput
    placeholder={placeholder}
    options={persons.map((p) => ({
      id: p.id,
      text: `${p.first_name} ${p.last_name}`,
    }))}
    {...rest}
  />
);

export const PersonTeamInput: FunctionComponent<
  {
    teams?: PersonTeam[];
  } & BaseSelectorInput
> = ({
  teams = Object.keys(personTeamNames) as PersonTeam[],
  placeholder = "Team",
  ...rest
}) => (
  <SelectorInput
    placeholder={placeholder}
    options={teams.map((t) => ({
      id: t,
      text: personTeamNames[t],
    }))}
    {...rest}
  />
);

export const PersonTypeInput: FunctionComponent<
  {
    types?: PersonType[];
  } & BaseSelectorInput
> = ({
  types = Object.keys(personTypeNames) as PersonType[],
  placeholder = "Type",
  ...rest
}) => (
  <SelectorInput
    placeholder={placeholder}
    options={types.map((t) => ({
      id: t,
      text: personTypeNames[t],
    }))}
    {...rest}
  />
);

export const SegmentInput: FunctionComponent<
  {
    segments: Awaited<ReturnType<typeof getExpeditieSegments>>;
  } & BaseSelectorInput
> = ({ segments, placeholder = "Segment", ...rest }) => (
  <SelectorInput
    placeholder={placeholder}
    options={segments.map((s) => ({
      id: `${s.id}`,
      text: `${s.description || (s.type == "flight" && "Vlucht") || "Segment"} (#${s.id}, ${s.persons.length} pers.)`,
    }))}
    {...rest}
  />
);

export const TimezoneInput: FunctionComponent<BasicInput<string>> = ({
  placeholder = "Tijdzone",
  value = "Europe/Amsterdam",
  ...rest
}) => (
  <SelectorInput
    placeholder={placeholder}
    options={Intl.supportedValuesOf("timeZone").map((zone) => ({
      id: zone,
      text: zone,
    }))}
    value={value}
    {...rest}
  />
);

type FormInputArrayProps<Value> = {
  values?: Value[];
  minSize?: number;

  children: (
    value: Value | undefined,

    inputAttributes: { disabled?: boolean; form?: string }
  ) => ComponentChildren;

  form?: string;
};

export const FormInputArray = <Value,>({
  values = [],
  minSize = 1,
  children,
  ...attrs
}: FormInputArrayProps<Value>) => (
  <div class="form-array" data-min-size={minSize}>
    {[
      ...values,
      ...Array(Math.max(0, minSize - values.length)).fill(undefined),
    ].map((value) => (
      <div class="form-array-row">
        <div class="form-array-item">{children(value, attrs)}</div>
        <button
          class="form-array-remove button-gray"
          disabled={values.length <= minSize}
        >
          –
        </button>
      </div>
    ))}

    <div class="form-array-proto" hidden>
      <div class="form-array-item">
        {children(undefined, { disabled: true, ...attrs })}
      </div>
      <button
        class="form-array-remove button-gray"
        disabled={values.length <= minSize}
      >
        –
      </button>
    </div>

    <button class="form-array-add button-gray">+</button>
  </div>
);
