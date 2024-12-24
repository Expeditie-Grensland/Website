import { FunctionComponent, toChildArray } from "preact";

export const NewItemForm: FunctionComponent<{
  action: string;
  buttonText?: string;
  multipart?: boolean;
}> = ({ action, buttonText = "Toevoegen", multipart, children }) => (
  <form
    action={action}
    method="POST"
    encType={multipart ? "multipart/form-data" : undefined}
  >
    {toChildArray(children).map((child) => (
      <div class="col-12 col-md-4 mb-2 me-md-2">{child}</div>
    ))}

    <div class="col-12 col-md-4 mb-2">
      <button class="btn btn-primary" type="submit">
        {buttonText}
      </button>
    </div>
  </form>
);
