import type { FunctionComponent } from "preact";

export const ClientVariable: FunctionComponent<{
  type?: "const" | "let";
  name: string;
  value: unknown;
}> = ({ type = "const", name, value }) => (
  <script
    // biome-ignore lint/security/noDangerouslySetInnerHtml: script with quotes
    dangerouslySetInnerHTML={{
      __html: `${type} ${name} = ${JSON.stringify(value)};`,
    }}
  />
);
