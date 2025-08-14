import { TZDate } from "@/lib/utils/tzdate";
import { z } from "zod";

const ymdDateSchema = z.instanceof(TZDate).refine(
  (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();
    return hours === 0 && minutes === 0 && seconds === 0 && milliseconds === 0;
  },
  { message: "Date must only contain YYYY-MM-DD (time part must be 00:00:00.000)." },
);

const ymdHm15DateSchema = z.instanceof(TZDate).refine(
  (date) => {
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();
    return [0, 15, 30, 45].includes(minutes) && seconds === 0 && milliseconds === 0;
  },
  { message: "Minutes must be 0, 15, 30, or 45, and seconds/milliseconds must be 0." },
);

export const parseYmdDate = (date: TZDate | string, timezone?: string): TZDate => {
  if (typeof date === "string") {
    date = new TZDate(date);
  }
  const zonedDate = timezone ? date.withTimeZone(timezone) : date;
  ymdDateSchema.parse(zonedDate);
  return zonedDate;
};

export const parseYmdHm15Date = (date: TZDate | string, timezone?: string): TZDate => {
  if (typeof date === "string") {
    date = new TZDate(date);
  }
  const zonedDate = timezone ? date.withTimeZone(timezone) : date;
  ymdHm15DateSchema.parse(zonedDate);
  return zonedDate;
};

export const getYmdDeltaDays = (before: TZDate, after: TZDate): number => {
  ymdDateSchema.parse(before);
  ymdDateSchema.parse(after);
  return (after.getTime() - before.getTime()) / (1000 * 60 * 60 * 24);
};

export const getYmdHm15DeltaMinutes = (before: TZDate, after: TZDate): number => {
  ymdHm15DateSchema.parse(before);
  ymdHm15DateSchema.parse(after);
  return (after.getTime() - before.getTime()) / (1000 * 60);
};

export const formatToLocaleYmdHm = (date: TZDate, timezone?: string): string => {
  const zonedDate = timezone ? date.withTimeZone(timezone) : date;
  return zonedDate.toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
