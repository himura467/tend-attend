import { DateTimePicker } from "@/components/organisms/shared/events/DateTimePicker";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TZDate } from "@/lib/utils/tzdate";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const formSchema = z.object({
  summary: z.string({
    error: (issue) => (issue.input === undefined ? "This field is required" : "Not a string"),
  }),
  location: z.string().nullable(),
});

interface UpdateEventFormProps {
  selectedEvent: {
    id: string;
    summary: string;
    location: string | null;
  };
  onSubmit: (eventId: string, values: z.infer<typeof formSchema>) => Promise<void>;
  onCancel: () => void;
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

export const UpdateEventForm = ({
  selectedEvent,
  onSubmit,
  onCancel,
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
}: UpdateEventFormProps): React.JSX.Element => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary: selectedEvent.summary,
      location: selectedEvent.location,
    },
  });

  // Update form values when selectedEvent changes
  React.useEffect(() => {
    form.reset({
      summary: selectedEvent.summary,
      location: selectedEvent.location,
    });
  }, [form, selectedEvent.summary, selectedEvent.location]);

  const handleSubmit = async (values: z.infer<typeof formSchema>): Promise<void> => {
    await onSubmit(selectedEvent.id, values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Input placeholder="Event summary" {...field} />
              </FormControl>
              <FormDescription>Provide a brief summary of the event.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Event location" {...field} value={field.value ?? undefined} />
              </FormControl>
              <FormDescription>Where will the event take place?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <FormLabel>Event Time</FormLabel>
          <DateTimePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            isAllDay={isAllDay}
            onIsAllDayChange={onIsAllDayChange}
            recurrences={recurrences}
            onRecurrencesChange={onRecurrencesChange}
            timezone={timezone}
            onTimezoneChange={onTimezoneChange}
          />
        </div>
        <div className="flex space-x-2">
          <Button type="submit">Update event</Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};
