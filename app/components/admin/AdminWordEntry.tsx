import { Form } from "@remix-run/react";
import { useState } from "react";
import type { ChangeEvent, FocusEvent, MouseEvent } from "react";
import type { Word } from "~/generated/db";

type Props = {
  item?: Word;
};

const AdminWordEntry = ({ item }: Props) => {
  const id = item?.id;
  const [word, setWord] = useState(item?.word || "");
  const [definitions, setDefinitions] = useState([
    ...(item?.definitions || []),
    "",
  ]);
  const [phonetic, setPhonetic] = useState(item?.phonetic || "");

  const updateWord = (e: ChangeEvent<HTMLInputElement>) => {
    setWord(e.target.value);
  };

  const updatePhonetic = (e: ChangeEvent<HTMLInputElement>) => {
    setPhonetic(e.target.value);
  };

  const updateDefinition = (
    e: ChangeEvent<HTMLTextAreaElement> | FocusEvent<HTMLTextAreaElement>,
    i: number
  ) => {
    const newDefinitions = [
      ...definitions.slice(0, i),
      ...(e.target.value !== "" || e.target === document.activeElement
        ? [e.target.value]
        : []),
      ...definitions.slice(i + 1),
    ];

    if (newDefinitions[newDefinitions.length - 1] !== "")
      newDefinitions.push("");

    setDefinitions(newDefinitions);
  };

  const submitDelete = (e: MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm(`Weet je zeker dat je het woord "${word}" wilt verwijderen?`))
      e.preventDefault();
  }

  return (
    <Form method="post" className="mb-16">
      {id && <input type="hidden" name="id" value={id} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
        <div className="">
          <input
            className="input-solid w-full font-bold mb-3 mr-0 md:pd-2"
            type="text"
            placeholder="Woord"
            name="word"
            value={word}
            onChange={updateWord}
          />
        </div>

        <div className="">
          <input
            className="input-solid w-full mb-3"
            type="text"
            placeholder="Fonetisch"
            name="phonetic"
            value={phonetic}
            onChange={updatePhonetic}
          />
        </div>
      </div>

      {definitions.map((definition, i) => (
        <textarea
          className="input-solid w-full mb-3 h-24"
          key={i}
          placeholder="Definitie"
          name="definition"
          value={definition}
          onChange={(e) => updateDefinition(e, i)}
          onBlur={(e) => updateDefinition(e, i)}
        />
      ))}

      {id ? (
        <>
          <button
            className="button bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 text-white float-left mr-3"
            type="submit"
            name="type"
            value="update"
          >
            Wijzigen
          </button>

          <button
            className="button bg-red-500 hover:bg-red-600 focus:bg-red-600 text-white"
            type="submit"
            name="type"
            value="delete"
            onClick={submitDelete}
          >
            Verwijderen
          </button>
        </>
      ) : (
        <button
          className="button bg-green-500 hover:bg-green-600 focus:bg-green-600 text-white"
          type="submit"
          name="type"
          value="create"
        >
          Toevoegen
        </button>
      )}
    </Form>
  );
};

export default AdminWordEntry;
