import { GoalForm } from "@/components/organisms/specific/events/event/goals/goal/GoalForm";
import { SidebarTemplate } from "@/components/templates/SidebarTemplate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { rr } from "@/lib/utils/reverseRouter";
import { ArrowLeft } from "lucide-react";
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link {...rr.events.event.goals.index(eventId, start)}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Event Goal</h1>
        </div>
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
