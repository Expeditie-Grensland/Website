import { FunctionComponent } from "preact";

export const ClientVariable: FunctionComponent<{
  type?: "const" | "let";
  name: string;
  value: unknown;
}> = ({ type = "const", name, value }) => (
  <script
    dangerouslySetInnerHTML={{
      __html: `${type} ${name} = ${JSON.stringify(value)};`,
    }}
  />
);
