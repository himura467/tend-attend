"use client";

import { ReviewForm } from "@/components/organisms/specific/events/reviews/ReviewForm";
import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NextPage } from "next";
import { useSearchParams } from "next/navigation";

const ReviewPage: NextPage = (): React.JSX.Element => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event_id");
  const start = searchParams.get("start");

  if (!eventId || !start) {
    return (
      <DialogTemplate>
        <div className="w-full space-y-6">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Review Page</h1>
          <Card>
            <CardHeader>
              <CardTitle>Missing Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Please provide event_id and start parameters.</p>
            </CardContent>
          </Card>
        </div>
      </DialogTemplate>
    );
  }

  return (
    <DialogTemplate>
      <div className="w-full space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Event Review</h1>
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm eventId={eventId} start={start} />
          </CardContent>
        </Card>
      </div>
    </DialogTemplate>
  );
};

export default ReviewPage;
