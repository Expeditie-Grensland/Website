import { FunctionComponent } from "preact";

export const InfoMessages: FunctionComponent<{
  messages: Record<string, string[]>;
}> = ({ messages }) => {
  if (!messages["info"]?.length && !messages["error"]?.length) return <></>;

  return (
    <div class="col-12 mb-4">
      {messages["error"]?.map((msg) => (
        <div class="alert alert-danger">{msg}</div>
      ))}
      {messages["info"]?.map((msg) => (
        <div class="alert alert-info">{msg}</div>
      ))}
    </div>
  );
};
