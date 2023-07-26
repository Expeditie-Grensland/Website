import { DateTime } from "luxon";
import { DateTimeInternal, dateTimeSchemaDefault } from "./model.js";

export const getInternalDate = (date: DateTime) => ({
  stamp: date.toSeconds(),
  zone: date.zone.name || dateTimeSchemaDefault.zone,
});

export const getLuxonDate = (date: DateTimeInternal) =>
  DateTime.fromSeconds(date.stamp, {
    zone: date.zone,
    locale: "nl-NL",
  });

export const getISODate = (date: DateTimeInternal) =>
  getLuxonDate(date).startOf("second").toISO({ includeOffset: false });
