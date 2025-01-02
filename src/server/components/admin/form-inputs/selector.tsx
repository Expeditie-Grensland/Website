import { FunctionComponent } from "preact";
import { getAllExpedities } from "../../../db/expeditie.js";
import { getAllPersons } from "../../../db/person.js";

type BasicSelector = {
  name: string;
  form?: string;
  value?: string | undefined | null;
  placeholder?: string;
  allowEmpty?: boolean;
};

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

export const ExpeditieSelector: FunctionComponent<
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

export const PersonSelector: FunctionComponent<
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

export const TeamSelector: FunctionComponent<
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
