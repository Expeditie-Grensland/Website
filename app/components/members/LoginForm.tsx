import { Form } from "@remix-run/react";

type Props = {
  error?: string;
  isWaiting: boolean;
};

const LoginForm = ({ error, isWaiting }: Props) => {
  const fields = [
    ["Gebruikersnaam", "username", "text", "maarten.de.vries"],
    ["Wachtwoord", "password", "password", "••••••••••••"],
  ];

  return (
    <Form method="post" className="py-20 px-5 max-w-md mx-auto">
      <h1 className="text-3xl mb-3">Log In</h1>

      {error && <p className="text-red-500 my-3">{error}</p>}

      {fields.map(([label, name, type, placeholder], index) => (
        <label className="block my-3" key={index}>
          <div className="mb-1">{label}</div>
          <input
            className="w-full input-solid"
            disabled={isWaiting}
            {...{ name, type, placeholder }}
          />
        </label>
      ))}

      <button className="w-full mb-3 mt-5 bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 text-white button">
        {isWaiting ? "..." : "Log In"}
      </button>
    </Form>
  );
};

export default LoginForm;
