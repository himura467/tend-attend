import { TZDateMini } from "@date-fns/tz";

export const applyTimezone = (date: Date, srcTz: string, dstTz: string): Date => {
  if (srcTz === dstTz) return date;
  return new TZDateMini(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    srcTz,
  ).withTimeZone(dstTz);
};
