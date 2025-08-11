import { applyTimezone } from "@/lib/utils/timezone";
import { TZDate } from "@/lib/utils/tzdate";
import { z } from "zod";

const ymdDateSchema = z
  .instanceof(TZDate)
  .refine(
    (date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const milliseconds = date.getMilliseconds();
      return hours === 0 && minutes === 0 && seconds === 0 && milliseconds === 0;
    },
    { message: "Date must only contain YYYY-MM-DD (time part must be 00:00:00.000)." },
  )
  .brand<"YmdDate">();
export type YmdDate = z.infer<typeof ymdDateSchema>;

const ymdHm15DateSchema = z
  .instanceof(TZDate)
  .refine(
    (date) => {
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const milliseconds = date.getMilliseconds();
      return [0, 15, 30, 45].includes(minutes) && seconds === 0 && milliseconds === 0;
    },
    { message: "Minutes must be 0, 15, 30, or 45, and seconds/milliseconds must be 0." },
  )
  .brand<"YmdHm15Date">();
export type YmdHm15Date = z.infer<typeof ymdHm15DateSchema>;

export const parseYmdDate = (date: TZDate | string, timezone?: string): YmdDate => {
  if (typeof date === "string") {
    date = new TZDate(date);
  }
  const zonedDate = timezone ? applyTimezone(date, timezone) : date;
  return ymdDateSchema.parse(zonedDate);
};

export const parseYmdHm15Date = (date: TZDate | string, timezone?: string): YmdHm15Date => {
  if (typeof date === "string") {
    date = new TZDate(date);
  }
  const zonedDate = timezone ? applyTimezone(date, timezone) : date;
  return ymdHm15DateSchema.parse(zonedDate);
};

export const getCurrentYmdDate = (date: TZDate | string): YmdDate => {
  if (typeof date === "string") {
    date = new TZDate(date);
  }
  date.setHours(0, 0, 0, 0);
  return ymdDateSchema.parse(date);
};

export const getYmdDeltaDays = (before: YmdDate, after: YmdDate): number => {
  return (after.getTime() - before.getTime()) / (1000 * 60 * 60 * 24);
};

export const getYmdHm15DeltaMinutes = (before: YmdHm15Date, after: YmdHm15Date): number => {
  return (after.getTime() - before.getTime()) / (1000 * 60);
};

export const formatToLocaleYmdHm = (date: TZDate, timezone?: string): string => {
  const zonedDate = timezone ? applyTimezone(date, timezone) : date;
  return zonedDate.toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
