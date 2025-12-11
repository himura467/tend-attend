import { ReviewForm } from "@/components/organisms/specific/events/reviews/ReviewForm";
import { SidebarTemplate } from "@/components/templates/SidebarTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NextPage } from "next";
import React from "react";

interface ReviewPageProps {
  params: Promise<{
    eventId: string;
    start: string;
    guestId: string;
  }>;
}

const ReviewPage: NextPage<ReviewPageProps> = async ({ params }): Promise<React.JSX.Element> => {
  const { eventId, start, guestId } = await params;

  return (
    <SidebarTemplate>
      <div className="w-full space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Event Review</h1>
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewForm eventId={eventId} start={start} guestId={guestId} />
          </CardContent>
        </Card>
      </div>
    </SidebarTemplate>
  );
};

export default ReviewPage;
