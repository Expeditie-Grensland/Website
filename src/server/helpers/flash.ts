import type { FastifySessionObject } from "@fastify/session";
import { Session } from "fastify";

type MessageType = keyof {
  [P in keyof Session as Session[P] extends string[] | undefined
    ? P
    : never]: any;
};

export const getMessages = (
  session: FastifySessionObject,
  type: MessageType
) => {
  const message = session[type] || [];
  session[type] = [];
  return message;
};

export const setMessage = (
  session: FastifySessionObject,
  type: MessageType,
  msg: string
) => {
  session[type] = [msg];
};
