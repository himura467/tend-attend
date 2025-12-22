import { GoalsList } from "@/components/organisms/specific/events/event/goals/GoalsList";
import { SidebarTemplate } from "@/components/templates/SidebarTemplate";
import { NextPage } from "next";
import React from "react";

interface EventGoalsPageProps {
  params: Promise<{
    eventId: string;
    start: string;
  }>;
}

const EventGoalsPage: NextPage<EventGoalsPageProps> = async ({ params }): Promise<React.JSX.Element> => {
  const { eventId, start } = await params;

  return (
    <SidebarTemplate>
      <div className="w-full space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Event Goals</h1>
        <GoalsList eventId={eventId} start={start} />
      </div>
    </SidebarTemplate>
  );
};

export default EventGoalsPage;
