import { DateTime, Info } from "luxon";

export const getDateTime = (stamp: number, zone: string) =>
  DateTime.fromSeconds(stamp, { zone, locale: "nl-NL" });

export const getISODate = (stamp: number, zone: string) =>
  getDateTime(stamp, zone).toISO({ includeOffset: false });

export const getTimeStamp = (dateTime: DateTime) => dateTime.toSeconds();

export const parseISODate = (isoDate: string, zone: string) => {
  const date = DateTime.fromISO(isoDate, { zone, locale: "nl-NL" });
  if (date.invalidExplanation) throw new Error(date.invalidExplanation);
  return date;
};

export const parseISODateTimeStamp = (isoDate: string, zone: string) =>
  getTimeStamp(parseISODate(isoDate, zone));

export const isValidTimeZone = (zone: string) => Info.isValidIANAZone(zone);
