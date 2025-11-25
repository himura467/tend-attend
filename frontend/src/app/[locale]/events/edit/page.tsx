import { EditEventsCalendarForm } from "@/components/organisms/specific/events/edit/EditEventsCalendarForm";
import { SidebarTemplate } from "@/components/templates/SidebarTemplate";
import { NextPage } from "next";

const EditEventsPage: NextPage = (): React.JSX.Element => {
  return (
    <SidebarTemplate>
      <div className="w-full space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Edit events</h1>
        <EditEventsCalendarForm />
      </div>
    </SidebarTemplate>
  );
};

export default EditEventsPage;
