import { Form } from "@remix-run/react";

type Props = {
  errorMsg?: string;
};

const LoginForm = ({ errorMsg }: Props) => {
  const fields = [
    ["Gebruikersnaam", "username", "text", "voor.achternaam"],
    ["Wachtwoord", "password", "password", "••••••••••••"],
  ];

  return (
    <Form method="post" className="py-20 px-5 max-w-md mx-auto">
      <h1 className="text-3xl mb-3">Log in</h1>

      {errorMsg && <p className="text-red-500 my-3"></p>}

      {fields.map(([label, name, type, placeholder], index) => (
        <label className="block my-3" key={index}>
          <div className="mb-1">{label}</div>
          <input
            className="block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-400 focus:ring-0"
            {...{ name, type, placeholder }}
          />
        </label>
      ))}

      <button className="block w-full my-3 mt-6 rounded-md bg-blue-500 px-5 py-2 hover:bg-blue-600 text-white">
        Log in
      </button>
    </Form>
  );
};

export default LoginForm;
