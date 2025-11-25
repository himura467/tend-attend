import { FolloweeCalendarList } from "@/components/organisms/specific/subscriptions/FolloweeCalendarList";
import { SidebarTemplate } from "@/components/templates/SidebarTemplate";
import { NextPage } from "next";
import React from "react";

const FolloweeCalendarsPage: NextPage = (): React.JSX.Element => {
  return (
    <SidebarTemplate>
      <div className="w-full space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Followee Calendars</h1>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm max-w-2xl">
            Subscribe to event calendars from people you follow and stay updated with their upcoming events.
          </p>
          <FolloweeCalendarList />
        </div>
      </div>
    </SidebarTemplate>
  );
};

export default FolloweeCalendarsPage;
