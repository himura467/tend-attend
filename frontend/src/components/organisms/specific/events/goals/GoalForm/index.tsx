"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createOrUpdateGoal, getGoal } from "@/lib/api/events";
import { Loader2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface GoalFormProps {
  eventId: string;
  start: string;
}

export const GoalForm = ({ eventId, start }: GoalFormProps): React.JSX.Element => {
  const [goalText, setGoalText] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const loadGoal = async (): Promise<void> => {
      try {
        const response = await getGoal(eventId, start);
        if (response.error_codes.length === 0) {
          setGoalText(response.goal_text);
        }
      } catch {
        toast.error("Failed to load goal");
      } finally {
        setIsLoading(false);
      }
    };

    void loadGoal();
  }, [eventId, start]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await createOrUpdateGoal(
        {
          goal_text: goalText,
        },
        eventId,
        start,
      );
      if (response.error_codes.length > 0) {
        toast.error("Failed to save goal");
        return;
      }
      toast.success("Goal saved successfully");
    } catch {
      toast.error("Failed to save goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="goal">Your Goal</Label>
        <Textarea
          id="goal"
          placeholder="Enter your goal for this event..."
          required
          value={goalText}
          onChange={(e) => setGoalText(e.target.value)}
          rows={4}
          className="mt-2"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            Saving...
          </>
        ) : (
          "Save Goal"
        )}
      </Button>
    </form>
  );
};
