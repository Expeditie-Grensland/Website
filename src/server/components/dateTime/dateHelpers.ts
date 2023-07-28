import { DateTime, Info } from "luxon";
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

export const getLuxonFromISODate = (isoDate: string, zone: string) => {
  const date = DateTime.fromISO(isoDate, { zone, locale: "nl-NL" });

  if (date.invalidExplanation)
    throw new Error(`Error: ${date.invalidExplanation}`);

  return date;
};

export const getInternalFromISODate = (isoDate: string, zone: string) =>
  getInternalDate(getLuxonFromISODate(isoDate, zone));

export const isValidTimeZone = (zone: string) =>
  Info.isValidIANAZone(zone);
