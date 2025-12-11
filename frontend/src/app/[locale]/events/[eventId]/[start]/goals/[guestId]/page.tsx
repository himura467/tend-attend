import { GoalForm } from "@/components/organisms/specific/events/goals/GoalForm";
import { SidebarTemplate } from "@/components/templates/SidebarTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NextPage } from "next";
import React from "react";

interface GoalPageProps {
  params: Promise<{
    eventId: string;
    start: string;
    guestId: string;
  }>;
}

const GoalPage: NextPage<GoalPageProps> = async ({ params }): Promise<React.JSX.Element> => {
  const { eventId, start, guestId } = await params;

  return (
    <SidebarTemplate>
      <div className="w-full space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Event Goal</h1>
        <Card>
          <CardHeader>
            <CardTitle>Set Your Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalForm eventId={eventId} start={start} guestId={guestId} />
          </CardContent>
        </Card>
      </div>
    </SidebarTemplate>
  );
};

export default GoalPage;
