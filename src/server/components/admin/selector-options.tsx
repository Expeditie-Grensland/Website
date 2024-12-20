import { FunctionComponent } from "preact";
import { getAllExpedities } from "../../db/expeditie.js";
import { getAllPersons } from "../../db/person.js";

type AllSelectorOptions = {
  selected?: string | undefined | null;
  allowEmpty?: boolean;
};

type SelectorOptions<T extends { id: string }> = {
  text: string;
  options: T[];
  optionText: (option: T) => string;
} & AllSelectorOptions;

const SelectorOptions = <T extends { id: string }>({
  text,
  options,
  optionText,
  selected,
  allowEmpty,
}: SelectorOptions<T>) => (
  <>
    <option selected={selected === undefined} disabled>
      {text}
    </option>
    {allowEmpty && (
      <option selected={selected === null} value="-">
        Geen
      </option>
    )}
    {options.map((option) => (
      <option selected={selected === option.id} value={option.id}>
        {optionText(option)}
      </option>
    ))}
  </>
);

export const ExpeditieSelectorOptions: FunctionComponent<
  {
    expedities: Awaited<ReturnType<typeof getAllExpedities>>;
  } & AllSelectorOptions
> = ({ expedities, ...rest }) => (
  <SelectorOptions
    text="Expeditie"
    options={expedities}
    optionText={(expeditie) => expeditie.name}
    {...rest}
  />
);

export const PersonSelectorOptions: FunctionComponent<
  {
    persons: Awaited<ReturnType<typeof getAllPersons>>;
  } & AllSelectorOptions
> = ({ persons, ...rest }) => (
  <SelectorOptions
    text="Persoon"
    options={persons}
    optionText={(person) => `${person.first_name} ${person.last_name}`}
    {...rest}
  />
);

export const TeamSelectorOptions: FunctionComponent<
  { teams: ("r" | "g" | "b")[] } & AllSelectorOptions
> = ({ teams = ["r", "g", "b"], ...rest }) => (
  <SelectorOptions
    text="Team"
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
