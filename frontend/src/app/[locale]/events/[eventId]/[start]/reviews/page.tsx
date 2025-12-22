import { ReviewsList } from "@/components/organisms/specific/events/event/reviews/ReviewsList";
import { SidebarTemplate } from "@/components/templates/SidebarTemplate";
import { NextPage } from "next";
import React from "react";

interface EventReviewsPageProps {
  params: Promise<{
    eventId: string;
    start: string;
  }>;
}

const EventReviewsPage: NextPage<EventReviewsPageProps> = async ({ params }): Promise<React.JSX.Element> => {
  const { eventId, start } = await params;

  return (
    <SidebarTemplate>
      <div className="w-full space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Event Reviews</h1>
        <ReviewsList eventId={eventId} start={start} />
      </div>
    </SidebarTemplate>
  );
};

export default EventReviewsPage;
