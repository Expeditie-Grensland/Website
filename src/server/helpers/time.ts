import { DateTime, Info } from "luxon";

export const getDateTime = (stamp: number, zone: string) =>
  DateTime.fromSeconds(stamp, { zone, locale: "nl-NL" });

export const getISODate = (stamp: number, zone: string) =>
  getDateTime(stamp, zone).toISO({ includeOffset: false });

export const formatTimeDayMonth = (stamp: number, zone: string) =>
  getDateTime(stamp, zone).toLocaleString({ month: "2-digit", day: "2-digit" });

// FIXME: Relative and short-format dates/times
export const formatTimeNicely = (stamp: number, zone: string) =>
  getDateTime(stamp, zone).toLocaleString({
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const formatTimeFull = (stamp: number, zone: string) =>
  getDateTime(stamp, zone).toLocaleString({
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "long",
  });

const getTimeStamp = (dateTime: DateTime) => dateTime.toSeconds();

const parseISODate = (isoDate: string, zone: string) => {
  const date = DateTime.fromISO(isoDate, { zone, locale: "nl-NL" });
  if (date.invalidExplanation) throw new Error(date.invalidExplanation);
  return date;
};

export const parseISODateTimeStamp = (isoDate: string, zone: string) =>
  getTimeStamp(parseISODate(isoDate, zone));

export const isValidTimeZone = (zone: string) => Info.isValidIANAZone(zone);
