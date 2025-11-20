import { EventAttendanceCalendarForm } from "@/components/organisms/specific/events/attend/EventAttendanceCalendarForm";
import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { rr } from "@/lib/utils/reverseRouter";
import { NextPage } from "next";

const AttendEventPage: NextPage = (): React.JSX.Element => {
  return (
    <DialogTemplate>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Attend events</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link {...rr.subscriptions.index()}>Followee Calendars</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link {...rr.events.edit.index()}>Edit Events</Link>
            </Button>
          </div>
        </div>
        <EventAttendanceCalendarForm />
      </div>
    </DialogTemplate>
  );
};

export default AttendEventPage;
