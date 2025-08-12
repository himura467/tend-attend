import { TZDateMini } from "@date-fns/tz";
import { z } from "zod";

// ISO-8601 compatible string schema
const iso8601Schema = z.string().refine(
  (str) => {
    // ISO-8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm:ss.sss (no Z allowed as timeZone parameter handles timezone)
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?$/;
    return iso8601Regex.test(str);
  },
  {
    message: "String must be in ISO-8601 format (YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss, YYYY-MM-DDTHH:mm:ss.sss).",
  },
);

// Custom TZDateMini wrapper that validates ISO-8601 strings
export class TZDate extends TZDateMini {
  constructor();
  constructor(dateStr: string, timeZone?: string);
  constructor(date: Date, timeZone?: string);
  constructor(timestamp: number, timeZone?: string);
  constructor(
    year: number,
    month: number,
    date: number,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number,
    timeZone?: string,
  );
  constructor(
    yearOrDateStrOrDateOrTimestamp?: number | string | Date,
    monthOrTimeZone?: number | string,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    milliseconds?: number,
    timeZone?: string,
  ) {
    if (yearOrDateStrOrDateOrTimestamp === undefined) {
      const now = new Date();
      super(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds(),
        "UTC",
      );
    } else if (typeof yearOrDateStrOrDateOrTimestamp === "string") {
      // Validate ISO-8601 string
      const validatedString = iso8601Schema.parse(yearOrDateStrOrDateOrTimestamp);
      const normalizedString = validatedString.includes("T") ? validatedString : `${validatedString}T00:00:00`;
      const date = new Date(normalizedString);
      super(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
        (monthOrTimeZone as string) || "UTC",
      );
    } else if (yearOrDateStrOrDateOrTimestamp instanceof Date) {
      super(
        yearOrDateStrOrDateOrTimestamp.getFullYear(),
        yearOrDateStrOrDateOrTimestamp.getMonth(),
        yearOrDateStrOrDateOrTimestamp.getDate(),
        yearOrDateStrOrDateOrTimestamp.getHours(),
        yearOrDateStrOrDateOrTimestamp.getMinutes(),
        yearOrDateStrOrDateOrTimestamp.getSeconds(),
        yearOrDateStrOrDateOrTimestamp.getMilliseconds(),
        (monthOrTimeZone as string) || "UTC",
      );
    } else if (typeof yearOrDateStrOrDateOrTimestamp === "number" && arguments.length <= 2) {
      super(yearOrDateStrOrDateOrTimestamp, (monthOrTimeZone as string) || "UTC");
    } else {
      super(
        yearOrDateStrOrDateOrTimestamp,
        monthOrTimeZone as number,
        date!,
        hours!,
        minutes!,
        seconds!,
        milliseconds!,
        timeZone || "UTC",
      );
    }
  }

  withTimeZone(timeZone: string): TZDate {
    const zonedDate = super.withTimeZone(timeZone);
    return new TZDate(zonedDate, timeZone);
  }

  addDays(days: number): TZDate {
    const newDate = new TZDate(this, this.timeZone);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  startOfDay(): TZDate {
    const newDate = new TZDate(this, this.timeZone);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  endOfDay(): TZDate {
    const newDate = new TZDate(this, this.timeZone);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }
}
