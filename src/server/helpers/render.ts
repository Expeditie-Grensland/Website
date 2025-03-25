import { ComponentProps, FunctionComponent, h } from "preact";
import { render } from "preact-render-to-string";
import { promiseAllProps } from "./async.js";
import { FastifyReply } from "fastify";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderComponent = async <T extends FunctionComponent<any>>(
  component: T,
  props: {
    [Key in keyof ComponentProps<T>]:
      | ComponentProps<T>[Key]
      | Promise<ComponentProps<T>[Key]>;
  }
) => {
  const awaitedProps = await promiseAllProps(props);
  const node = h(component, awaitedProps);
  return `<!DOCTYPE html>${render(node)}`;
};

export const replyHtml = function (this: FastifyReply, html: string) {
  this.header("Content-Type", "text/html; charset=utf-8");
  this.send(html);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const replyComponent = async function <T extends FunctionComponent<any>>(
  this: FastifyReply,
  component: T,
  props: {
    [Key in keyof ComponentProps<T>]:
      | ComponentProps<T>[Key]
      | Promise<ComponentProps<T>[Key]>;
  }
) {
  this.sendHtml(await renderComponent(component, props));
};
