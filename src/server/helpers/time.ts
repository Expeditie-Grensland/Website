export const getDateTime = (stamp: number, zone: string) =>
  Temporal.Instant.fromEpochMilliseconds(stamp * 1000).toZonedDateTimeISO(zone);

export const getISODate = (stamp: number, zone: string) => {
  const zdt = getDateTime(stamp, zone);
  return (
    zdt
      .toPlainDateTime()
      // @ts-expect-error timeZoneName not yet in the types
      .toString({ smallestUnit: "seconds", timeZoneName: "never" })
  );
};

export const formatTimeDayMonth = (stamp: number, zone: string) => {
  const zdt = getDateTime(stamp, zone);
  return new Intl.DateTimeFormat("nl-NL", {
    month: "2-digit",
    day: "2-digit",
    timeZone: zone,
  }).format(new Date(zdt.epochMilliseconds));
};

// FIXME: Relative and short-format dates/times
export const formatTimeNicely = (stamp: number, zone: string) => {
  const zdt = getDateTime(stamp, zone);
  return new Intl.DateTimeFormat("nl-NL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: zone,
  }).format(new Date(zdt.epochMilliseconds));
};

export const formatTimeFull = (stamp: number, zone: string) => {
  const zdt = getDateTime(stamp, zone);
  return new Intl.DateTimeFormat("nl-NL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "long",
    timeZone: zone,
  }).format(new Date(zdt.epochMilliseconds));
};

const getTimeStamp = (zdt: Temporal.ZonedDateTime) =>
  Math.floor(zdt.epochMilliseconds / 1000);

const parseISODate = (isoDate: string, zone: string) =>
  Temporal.ZonedDateTime.from(`${isoDate}[${zone}]`);

export const parseISODateTimeStamp = (isoDate: string, zone: string) =>
  getTimeStamp(parseISODate(isoDate, zone));

export const isValidTimeZone = (zone: string) =>
  Intl.supportedValuesOf("timeZone").includes(zone);

export const formatDateRange = (startDate: Date, endDate: Date) => {
  const endDateFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const yearSame = startDate.getFullYear() === endDate.getFullYear();
  const monthSame = yearSame && startDate.getMonth() === endDate.getMonth();

  if (monthSame && startDate.getDate() === endDate.getDate()) {
    return endDate.toLocaleString("nl-NL", endDateFormat);
  }

  const startDateFormat: Intl.DateTimeFormatOptions = {
    year: yearSame ? undefined : "numeric",
    month: monthSame ? undefined : "long",
    day: "numeric",
  };

  return `${startDate.toLocaleString("nl-NL", startDateFormat)} – ${endDate.toLocaleString("nl-NL", endDateFormat)}`;
};
