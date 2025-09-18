import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSSRSafeFormat } from "@/hooks/useSSRSafeFormat";
import { useTimezone } from "@/hooks/useTimezone";
import { addEXDate, addRDate, getEXDates, getRDates, removeEXDate, removeRDate } from "@/lib/utils/icalendar";
import { TZDate } from "@/lib/utils/tzdate";
import { CalendarIcon, Plus, X } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface DateItemState {
  date: TZDate;
  isNew?: boolean; // Recently added, not yet saved
  isRemoved?: boolean; // Marked for removal, not yet saved
}

interface RecurrenceDateEditorProps {
  recurrences: string[];
  onRecurrencesChange: (recurrences: string[]) => void;
  type: "RDATE" | "EXDATE";
  isAllDay: boolean;
}

export const RecurrenceDateEditor = ({
  recurrences,
  onRecurrencesChange,
  type,
  isAllDay,
}: RecurrenceDateEditorProps): React.JSX.Element => {
  const browserTimezone = useTimezone();

  const [pendingDates, setPendingDates] = React.useState<DateItemState[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<TZDate>();

  // Get current dates from recurrences using rrule library
  const savedDates = React.useMemo(() => {
    const dates = type === "RDATE" ? getRDates(recurrences, browserTimezone) : getEXDates(recurrences, browserTimezone);
    return dates.sort((a, b) => a.getTime() - b.getTime());
  }, [recurrences, type, browserTimezone]);

  // Combine saved and pending dates for display
  const displayDates = React.useMemo(() => {
    const allDates: DateItemState[] = [
      ...savedDates.map((date) => ({ date, isNew: false, isRemoved: false })),
      ...pendingDates,
    ];

    // Remove duplicates and apply pending changes
    const uniqueDates = allDates.reduce((acc, item) => {
      const existing = acc.find((d) => d.date.getTime() === item.date.getTime());
      if (existing) {
        // Update existing item with latest state
        existing.isNew = item.isNew || existing.isNew;
        existing.isRemoved = item.isRemoved || existing.isRemoved;
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as DateItemState[]);

    return uniqueDates.filter((item) => !item.isRemoved).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [savedDates, pendingDates]);

  const handleAddDate = (date: TZDate): void => {
    // Check if date already exists
    const exists = displayDates.some((item) => item.date.getTime() === date.getTime());
    if (exists) {
      const dateText = date.toLocaleDateString();
      const actionText = type === "RDATE" ? "additional date" : "exclusion date";
      toast.error(`Date ${dateText} is already added as an ${actionText}`);
      setIsCalendarOpen(false);
      setSelectedDate(undefined);
      return;
    }

    // Add to pending dates
    setPendingDates((prev) => [...prev, { date, isNew: true }]);

    // Update recurrences
    const newRecurrences = type === "RDATE" ? addRDate(recurrences, date) : addEXDate(recurrences, date);
    onRecurrencesChange(newRecurrences);
    setIsCalendarOpen(false);
    setSelectedDate(undefined);
  };

  const handleRemoveDate = (dateToRemove: TZDate): void => {
    // Update pending state
    setPendingDates((prev) =>
      prev.map((item) => (item.date.getTime() === dateToRemove.getTime() ? { ...item, isRemoved: true } : item)),
    );

    // Update recurrences
    const newRecurrences =
      type === "RDATE" ? removeRDate(recurrences, dateToRemove) : removeEXDate(recurrences, dateToRemove);
    onRecurrencesChange(newRecurrences);
  };

  const title = type === "RDATE" ? "Additional Dates" : "Excluded Dates";
  const description =
    type === "RDATE"
      ? "Add specific dates when this event should occur (beyond the regular recurrence pattern)"
      : "Exclude specific dates when this event should not occur (despite the regular recurrence pattern)";

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {displayDates.length > 0 && (
        <div className="space-y-2">
          {displayDates.map((dateItem, index) => (
            <DateItem
              key={index}
              date={dateItem.date}
              isNew={dateItem.isNew}
              onRemove={() => handleRemoveDate(dateItem.date)}
            />
          ))}
        </div>
      )}

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add {type === "RDATE" ? "Date" : "Exclusion"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && handleAddDate(new TZDate(date, isAllDay ? "UTC" : browserTimezone))}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface DateItemProps {
  date: TZDate;
  isNew?: boolean;
  onRemove: () => void;
}

const DateItem = ({ date, isNew = false, onRemove }: DateItemProps): React.JSX.Element => {
  const dateFormatted = useSSRSafeFormat(date, "EEE MMM dd, yyyy");
  const timeFormatted = useSSRSafeFormat(date, "HH:mm");

  return (
    <div
      className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
        isNew ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : ""
      }`}
    >
      <div className="flex items-center space-x-2">
        <CalendarIcon className={`h-4 w-4 ${isNew ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} />
        <span className={isNew ? "text-green-700 dark:text-green-300" : ""}>{dateFormatted}</span>
        {date.getHours() !== 0 || date.getMinutes() !== 0 ? (
          <span className={`${isNew ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
            at {timeFormatted}
          </span>
        ) : null}
        {isNew && (
          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full">
            New
          </span>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 w-6 p-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
