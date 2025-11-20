import { FolloweeCalendarList } from "@/components/organisms/specific/subscriptions/FolloweeCalendarList";
import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { rr } from "@/lib/utils/reverseRouter";
import { NextPage } from "next";
import React from "react";

const FolloweeCalendarsPage: NextPage = (): React.JSX.Element => {
  return (
    <DialogTemplate>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Followee Calendars</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link {...rr.events.attend.index()}>Attend Events</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link {...rr.events.edit.index()}>Edit Events</Link>
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm max-w-2xl">
            Subscribe to event calendars from people you follow and stay updated with their upcoming events.
          </p>
          <FolloweeCalendarList />
        </div>
      </div>
    </DialogTemplate>
  );
};

export default FolloweeCalendarsPage;
