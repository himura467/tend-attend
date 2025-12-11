"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewInfo } from "@/lib/api/dtos/event";
import { getEventReviews } from "@/lib/api/events";
import { rr } from "@/lib/utils/reverseRouter";
import { routerPush } from "@/lib/utils/router";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ReviewsListProps {
  eventId: string;
  start: string;
}

export const ReviewsList = ({ eventId, start }: ReviewsListProps): React.JSX.Element => {
  const router = useRouter();

  const [reviews, setReviews] = useState<ReviewInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await getEventReviews(eventId, start);
        if (response.error_codes && response.error_codes.length > 0) {
          setError("Failed to load reviews");
        } else {
          setReviews(response.reviews);
        }
      } catch {
        setError("An error occurred while loading reviews");
      } finally {
        setLoading(false);
      }
    };

    void fetchReviews();
  }, [eventId, start]);

  const handleReviewClick = (accountId: string): void => {
    routerPush(rr.events.event.reviews.review.index(eventId, start, accountId), router);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading reviews...</p>
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

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No reviews have been written for this event yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card
          key={review.account_id}
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => handleReviewClick(review.account_id)}
        >
          <CardHeader>
            <CardTitle className="text-lg">{review.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{review.review_text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
