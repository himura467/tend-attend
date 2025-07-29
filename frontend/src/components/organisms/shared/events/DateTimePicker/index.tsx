import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { areEqualByRegExps } from "@/lib/utils/array";
import { getCurrentYmdDate } from "@/lib/utils/date";
import { applyTimezone } from "@/lib/utils/timezone";
import { addDays, format } from "date-fns";
import { CalendarIcon, Clock, Repeat } from "lucide-react";
import React from "react";

type RecurrencesOption = {
  label: string;
  value: string[];
  regExps: RegExp[];
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
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  isAllDay: boolean;
  onIsAllDayChange: (isAllDay: boolean) => void;
  recurrences: string[];
  onRecurrencesChange: (recurrences: string[]) => void;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}

export const DateTimePicker = ({
  startDate = getCurrentYmdDate(new Date()),
  endDate = addDays(getCurrentYmdDate(new Date()), 1),
  onStartDateChange,
  onEndDateChange,
  isAllDay,
  onIsAllDayChange,
  recurrences,
  onRecurrencesChange,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  onTimezoneChange,
}: DateTimePickerProps): React.JSX.Element => {
  const timeOptions = React.useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 15, 30, 45]) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        options.push(time);
      }
    }
    return options;
  }, []);

  const recurrencesOptions = React.useMemo((): RecurrencesOption[] => {
    const localStart = applyTimezone(startDate, timezone, Intl.DateTimeFormat().resolvedOptions().timeZone);
    const month = (localStart.getMonth() + 1).toString();
    const day = localStart.getDate().toString();
    const hour = localStart.getHours().toString();
    const minute = localStart.getMinutes().toString();
    const dayOfWeek = format(localStart, "EEE").toUpperCase().slice(0, 2);
    return [
      {
        label: "Does not repeat",
        value: [],
        regExps: [],
      },
      {
        label: "Every day",
        value: [`RRULE:FREQ=DAILY;BYHOUR=${hour};BYMINUTE=${minute};BYSECOND=0`],
        regExps: [/^RRULE:FREQ=DAILY;BYHOUR=\d{1,2};BYMINUTE=\d{1,2};BYSECOND=0$/],
      },
      {
        label: "Every week",
        value: [`RRULE:FREQ=WEEKLY;BYDAY=${dayOfWeek};BYHOUR=${hour};BYMINUTE=${minute};BYSECOND=0`],
        regExps: [/^RRULE:FREQ=WEEKLY;BYDAY=[A-Z]{2};BYHOUR=\d{1,2};BYMINUTE=\d{1,2};BYSECOND=0$/],
      },
      {
        label: "Every 2 weeks",
        value: [`RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=${dayOfWeek};BYHOUR=${hour};BYMINUTE=${minute};BYSECOND=0`],
        regExps: [/^RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=[A-Z]{2};BYHOUR=\d{1,2};BYMINUTE=\d{1,2};BYSECOND=0$/],
      },
      {
        label: "Every month",
        value: [`RRULE:FREQ=MONTHLY;BYMONTHDAY=${day};BYHOUR=${hour};BYMINUTE=${minute};BYSECOND=0`],
        regExps: [/^RRULE:FREQ=MONTHLY;BYMONTHDAY=\d{1,2};BYHOUR=\d{1,2};BYMINUTE=\d{1,2};BYSECOND=0$/],
      },
      {
        label: "Every year",
        value: [`RRULE:FREQ=YEARLY;BYMONTH=${month};BYMONTHDAY=${day};BYHOUR=${hour};BYMINUTE=${minute};BYSECOND=0`],
        regExps: [/^RRULE:FREQ=YEARLY;BYMONTH=\d{1,2};BYMONTHDAY=\d{1,2};BYHOUR=\d{1,2};BYMINUTE=\d{1,2};BYSECOND=0$/],
      },
    ];
  }, [startDate, timezone]);

  const getDuration = (): string => {
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h`;
  };

  const getRecurrencesOption = React.useCallback((): RecurrencesOption => {
    const option = recurrencesOptions.find((r) => areEqualByRegExps(recurrences, r.regExps));
    if (!option) throw new Error("Unsupported recurrences");
    return option;
  }, [recurrences, recurrencesOptions]);

  React.useEffect(() => {
    const option = getRecurrencesOption();
    onRecurrencesChange(option.value);
  }, [getRecurrencesOption, onRecurrencesChange, startDate, timezone]);

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
                  {format(startDate, "HH:mm")}
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
                        const newDate = new Date(startDate);
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
                  {format(endDate, "HH:mm")}
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
                        const newDate = new Date(endDate);
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
                {format(startDate, "EEE MMM dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && onStartDateChange(date)}
                initialFocus
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
                {format(endDate, "EEE MMM dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && onEndDateChange(date)}
                initialFocus
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
                    recurrences === r.value && "bg-accent text-accent-foreground",
                  )}
                  onClick={() => onRecurrencesChange(r.value)}
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
    </div>
  );
};
