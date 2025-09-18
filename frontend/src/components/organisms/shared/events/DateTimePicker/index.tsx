import { RecurrenceDateEditor } from "@/components/organisms/shared/events/RecurrenceDateEditor";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSSRSafeFormat } from "@/hooks/useSSRSafeFormat";
import { useTimezone } from "@/hooks/useTimezone";
import { cn } from "@/lib/utils";
import { Frequency, hasRRule, matchesFrequency } from "@/lib/utils/icalendar";
import { generateTimeOptions } from "@/lib/utils/timeOptions";
import { TZDate } from "@/lib/utils/tzdate";
import { format } from "date-fns";
import { CalendarIcon, Clock, Repeat } from "lucide-react";
import React from "react";

type RecurrencesOption = {
  label: string;
  value?: string;
  matcher: (rrules: string[]) => boolean;
};

type TimezoneOption = {
  label: string;
  value: string;
};

const timezoneOptions: TimezoneOption[] = [
  {
    label: "UTC",
    value: "UTC",
  },
  {
    label: "Tokyo",
    value: "Asia/Tokyo",
  },
];

interface DateTimePickerProps {
  startDate: TZDate;
  endDate: TZDate;
  onStartDateChange: (date: TZDate) => void;
  onEndDateChange: (date: TZDate) => void;
  isAllDay: boolean;
  onIsAllDayChange: (isAllDay: boolean) => void;
  recurrences: string[];
  onRecurrencesChange: (recurrences: string[]) => void;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}

export const DateTimePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isAllDay,
  onIsAllDayChange,
  recurrences,
  onRecurrencesChange,
  timezone,
  onTimezoneChange,
}: DateTimePickerProps): React.JSX.Element => {
  const browserTimezone = useTimezone();

  const timeOptions = React.useMemo(() => generateTimeOptions(), []);

  // SSR-safe date formatting to prevent hydration mismatches
  const startTimeFormatted = useSSRSafeFormat(startDate, "HH:mm");
  const endTimeFormatted = useSSRSafeFormat(endDate, "HH:mm");
  const startDateFormatted = useSSRSafeFormat(startDate, "EEE MMM dd");
  const endDateFormatted = useSSRSafeFormat(endDate, "EEE MMM dd");

  const getDuration = (): string => {
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h`;
  };

  const recurrencesOptions = React.useMemo((): RecurrencesOption[] => {
    const localStart = startDate.withTimeZone(browserTimezone);
    const month = (localStart.getMonth() + 1).toString();
    const day = localStart.getDate().toString();
    const hour = localStart.getHours().toString();
    const minute = localStart.getMinutes().toString();
    const dayOfWeek = format(localStart, "EEE").toUpperCase().slice(0, 2);
    return [
      {
        label: "Does not repeat",
        value: undefined,
        matcher: (rrules: string[]) => matchesFrequency(rrules),
      },
      {
        label: "Every day",
        value: `RRULE:FREQ=DAILY;BYHOUR=${hour};BYMINUTE=${minute};BYSECOND=0`,
        matcher: (rrules: string[]) => matchesFrequency(rrules, Frequency.DAILY, 1),
      },
      {
        label: "Every week",
        value: `RRULE:FREQ=WEEKLY;BYDAY=${dayOfWeek};BYHOUR=${hour};BYMINUTE=${minute};BYSECOND=0`,
        matcher: (rrules: string[]) => matchesFrequency(rrules, Frequency.WEEKLY, 1),
      },
      {
        label: "Every 2 weeks",
        value: `RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=${dayOfWeek};BYHOUR=${hour};BYMINUTE=${minute};BYSECOND=0`,
        matcher: (rrules: string[]) => matchesFrequency(rrules, Frequency.WEEKLY, 2),
      },
      {
        label: "Every month",
        value: `RRULE:FREQ=MONTHLY;BYMONTHDAY=${day};BYHOUR=${hour};BYMINUTE=${minute};BYSECOND=0`,
        matcher: (rrules: string[]) => matchesFrequency(rrules, Frequency.MONTHLY, 1),
      },
      {
        label: "Every year",
        value: `RRULE:FREQ=YEARLY;BYMONTH=${month};BYMONTHDAY=${day};BYHOUR=${hour};BYMINUTE=${minute};BYSECOND=0`,
        matcher: (rrules: string[]) => matchesFrequency(rrules, Frequency.YEARLY, 1),
      },
    ];
  }, [browserTimezone, startDate]);

  const getRecurrencesOption = React.useCallback((): RecurrencesOption => {
    const option = recurrencesOptions.find((r) => r.matcher(recurrences));
    if (!option) throw new Error("Unsupported recurrences");
    return option;
  }, [recurrences, recurrencesOptions]);

  // Update recurrence rule with DTSTART and TZID, preserving existing RDATE/EXDATE entries
  const updateRecurrenceRule = React.useCallback(
    (newRRule?: string) => {
      if (!newRRule) {
        onRecurrencesChange([]);
        return;
      }

      // Separate existing RDATE/EXDATE from RRULE and DTSTART entries
      const preservedEntries = recurrences.filter(
        (recurrence) => !recurrence.startsWith("RRULE:") && !recurrence.startsWith("DTSTART"),
      );

      // Add DTSTART with TZID for proper frontend RRule parsing
      const dtstartEntry = isAllDay
        ? `DTSTART;VALUE=DATE:${startDate.toISOString().split("T")[0].replace(/-/g, "")}`
        : `DTSTART;TZID=${timezone}:${startDate.withTimeZone("UTC").toISOString().replace(/[-:]/g, "").split(".")[0]}`;

      const updatedRecurrences = [dtstartEntry, newRRule, ...preservedEntries];
      onRecurrencesChange(updatedRecurrences);
    },
    [recurrences, onRecurrencesChange, isAllDay, startDate, timezone],
  );

  return (
    <div className="flex flex-col space-y-4 rounded-lg border p-4">
      {!isAllDay && (
        <div className="flex items-center space-x-2">
          <Clock className="text-muted-foreground h-5 w-5" />
          <div className="flex items-center space-x-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-[120px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  {startTimeFormatted}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <div className="h-60 overflow-y-auto">
                  {timeOptions.map((time) => (
                    <Button
                      key={time}
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      onClick={() => {
                        const [hours, minutes] = time.split(":").map(Number);
                        const newDate = new TZDate(startDate, browserTimezone);
                        newDate.setHours(hours, minutes);
                        onStartDateChange(newDate);
                      }}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">→</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-[120px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  {endTimeFormatted}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <div className="h-60 overflow-y-auto">
                  {timeOptions.map((time) => (
                    <Button
                      key={time}
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      onClick={() => {
                        const [hours, minutes] = time.split(":").map(Number);
                        const newDate = new TZDate(endDate, browserTimezone);
                        newDate.setHours(hours, minutes);
                        onEndDateChange(newDate);
                      }}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">{getDuration()}</span>
          </div>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <CalendarIcon className="text-muted-foreground h-5 w-5" />
        <div className="flex items-center space-x-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-[120px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
              >
                {startDateFormatted}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && onStartDateChange(new TZDate(date, browserTimezone))}
                autoFocus
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground">→</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-[120px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
              >
                {endDateFormatted}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && onEndDateChange(new TZDate(date, browserTimezone))}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex items-center space-x-4 pt-4">
        <div className="flex items-center space-x-2">
          <Switch id="all-day" checked={isAllDay} onCheckedChange={onIsAllDayChange} />
          <label htmlFor="all-day" className="text-muted-foreground text-sm">
            {isAllDay ? "All day" : "Timed"}
          </label>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex items-center space-x-2 text-sm",
                getRecurrencesOption().label === "Does not repeat" && "text-muted-foreground",
              )}
            >
              <Repeat className="h-4 w-4" />
              <span>
                {getRecurrencesOption().label === "Does not repeat" ? "Repeat" : getRecurrencesOption().label}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="start">
            <div className="bg-popover rounded-md p-1">
              {recurrencesOptions.map((r) => (
                <Button
                  key={r.label}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-normal",
                    r.matcher(recurrences) && "bg-accent text-accent-foreground",
                  )}
                  onClick={() => updateRecurrenceRule(r.value)}
                >
                  <span className="flex flex-col items-start">
                    <span>{r.label}</span>
                  </span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {!isAllDay && (
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezoneOptions.map((tz) => (
                <SelectItem key={tz.label} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {hasRRule(recurrences) && (
        <div className="space-y-4 border-t pt-4">
          <RecurrenceDateEditor
            recurrences={recurrences}
            onRecurrencesChange={onRecurrencesChange}
            type="RDATE"
            isAllDay={isAllDay}
            defaultTime={startDate}
          />
          <RecurrenceDateEditor
            recurrences={recurrences}
            onRecurrencesChange={onRecurrencesChange}
            type="EXDATE"
            isAllDay={isAllDay}
            defaultTime={startDate}
          />
        </div>
      )}
    </div>
  );
};
