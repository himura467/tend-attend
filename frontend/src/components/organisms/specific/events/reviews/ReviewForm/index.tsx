"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createOrUpdateReview, getReview } from "@/lib/api/events";
import { Loader2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface ReviewFormProps {
  eventId: string;
  start: string;
}

export const ReviewForm = ({ eventId, start }: ReviewFormProps): React.JSX.Element => {
  const [reviewText, setReviewText] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const loadReview = async (): Promise<void> => {
      try {
        const response = await getReview(eventId, start);
        if (response.error_codes.length === 0) {
          setReviewText(response.review_text);
        }
      } catch {
        toast.error("Failed to load review");
      } finally {
        setIsLoading(false);
      }
    };

    void loadReview();
  }, [eventId, start]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await createOrUpdateReview(
        {
          review_text: reviewText,
        },
        eventId,
        start,
      );
      if (response.error_codes.length > 0) {
        toast.error("Failed to save review");
        return;
      }
      toast.success("Review saved successfully");
    } catch {
      toast.error("Failed to save review");
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
        <Label htmlFor="review">Your Review</Label>
        <Textarea
          id="review"
          placeholder="Enter your review for this event..."
          required
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
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
          "Save Review"
        )}
      </Button>
    </form>
  );
};
