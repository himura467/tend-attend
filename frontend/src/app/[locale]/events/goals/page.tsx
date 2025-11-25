"use client";

import { GoalForm } from "@/components/organisms/specific/events/goals/GoalForm";
import { SidebarTemplate } from "@/components/templates/SidebarTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NextPage } from "next";
import { useSearchParams } from "next/navigation";

const GoalPage: NextPage = (): React.JSX.Element => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event_id");
  const start = searchParams.get("start");

  if (!eventId || !start) {
    return (
      <SidebarTemplate>
        <div className="w-full space-y-6">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Goal Page</h1>
          <Card>
            <CardHeader>
              <CardTitle>Missing Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Please provide event_id and start parameters.</p>
            </CardContent>
          </Card>
        </div>
      </SidebarTemplate>
    );
  }

  return (
    <SidebarTemplate>
      <div className="w-full space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Event Goal</h1>
        <Card>
          <CardHeader>
            <CardTitle>Set Your Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalForm eventId={eventId} start={start} />
          </CardContent>
        </Card>
      </div>
    </SidebarTemplate>
  );
};

export default GoalPage;
