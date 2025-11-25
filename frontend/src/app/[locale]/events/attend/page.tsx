import { EventAttendanceCalendarForm } from "@/components/organisms/specific/events/attend/EventAttendanceCalendarForm";
import { SidebarTemplate } from "@/components/templates/SidebarTemplate";
import { NextPage } from "next";

const AttendEventPage: NextPage = (): React.JSX.Element => {
  return (
    <SidebarTemplate>
      <div className="w-full space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Attend events</h1>
        <EventAttendanceCalendarForm />
      </div>
    </SidebarTemplate>
  );
};

export default AttendEventPage;
