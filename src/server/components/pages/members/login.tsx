import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";
import { PasswordInput, TextInput } from "../../admin/form-inputs.js";

const LoginPage: FunctionComponent<{
  messages: string[];
}> = ({ messages }) => (
  <Page
    title="Expeditie - Log In"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container">
      <NavigationBar type="no-user" backTo="home" />

      <form
        class="login-form"
        action="/leden/login"
        method="POST"
        onSubmit="window.umami?.track('login', { gebruiker: document.getElementById('username').value.toLowerCase() })"
      >
        <h1 class="page-title">Inloggen</h1>

        {messages?.map((message) => <div class="error-text">{message}</div>)}

        <TextInput
          name="username"
          placeholder="Gebruikersnaam"
          required
          autoFocus
        />
        <PasswordInput name="password" placeholder="Wachtwoord" required />

        <button class="button-main" type="submit">
          Log in
        </button>
      </form>
    </div>
  </Page>
);

export const renderLoginPage = (props: ComponentProps<typeof LoginPage>) =>
  render(<LoginPage {...props} />);
