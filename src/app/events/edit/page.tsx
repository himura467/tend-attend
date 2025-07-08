import { EditEventsCalendarForm } from "@/components/organisms/specific/events/edit/EditEventsCalendarForm";
import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { Button } from "@/components/ui/button";
import { rr } from "@/lib/utils/reverseRouter";
import { NextPage } from "next";
import Link from "next/link";

const EditEventsPage: NextPage = (): React.JSX.Element => {
  return (
    <DialogTemplate>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Edit events</h1>
          <Button variant="outline" asChild>
            <Link {...rr.events.attend.index()}>Attend Events</Link>
          </Button>
        </div>
        <EditEventsCalendarForm />
      </div>
    </DialogTemplate>
  );
};

export default EditEventsPage;
