"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalInfo } from "@/lib/api/dtos/event";
import { getEventGoals } from "@/lib/api/events";
import { useRouter } from "@/i18n/navigation";
import { rr } from "@/lib/utils/reverseRouter";
import { routerPush } from "@/lib/utils/router";
import { useEffect, useState } from "react";

interface GoalsListProps {
  eventId: string;
  start: string;
}

export const GoalsList = ({ eventId, start }: GoalsListProps): React.JSX.Element => {
  const router = useRouter();

  const [goals, setGoals] = useState<GoalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoals = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await getEventGoals(eventId, start);
        if (response.error_codes && response.error_codes.length > 0) {
          setError("Failed to load goals");
        } else {
          setGoals(response.goals);
        }
      } catch {
        setError("An error occurred while loading goals");
      } finally {
        setLoading(false);
      }
    };

    void fetchGoals();
  }, [eventId, start]);

  const handleGoalClick = (accountId: string): void => {
    routerPush(rr.events.event.goals.goal.index(eventId, start, accountId), router);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading goals...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No goals have been set for this event yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <Card
          key={goal.account_id}
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => handleGoalClick(goal.account_id)}
        >
          <CardHeader>
            <CardTitle className="text-lg">{goal.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{goal.goal_text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
