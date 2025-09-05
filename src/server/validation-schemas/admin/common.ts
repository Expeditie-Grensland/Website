import { z } from "zod";
import { getExpeditie } from "../../db/expeditie.js";
import { isValidTimeZone, parseISODateTimeStamp } from "../../helpers/time.js";

export const timeZoneSchema = z
  .string()
  .refine(isValidTimeZone, { message: "Geen geldige tijdzone" });

export const idSchema = z.string().regex(/^[a-z0-9-]+/, {
  message: "Mag alleen kleine letters, cijfers en streepjes bevatten",
});

export const checkboxSchema = z.preprocess(
  (value) => value == "on",
  z.boolean()
);

export const localTimeTransformer = <
  T extends { time_local: string; time_zone: string },
>({
  time_local,
  ...rest
}: T) => ({
  ...rest,
  time_stamp: parseISODateTimeStamp(time_local, rest.time_zone),
});

export const dateSchema = z.iso.date().transform((string) => new Date(string));

export const expeditieIdCheckSchema = z
  .string()
  .transform(getExpeditie)
  .nonoptional();
