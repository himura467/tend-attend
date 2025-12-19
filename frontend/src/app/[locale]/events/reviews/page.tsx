import { FollowingEventsReviewsList } from "@/components/organisms/specific/events/reviews/FollowingEventsReviewsList";
import { SidebarTemplate } from "@/components/templates/SidebarTemplate";
import { NextPage } from "next";
import React from "react";

const FollowingEventsReviewsPage: NextPage = (): React.JSX.Element => {
  return (
    <SidebarTemplate>
      <div className="w-full space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Following Events Reviews</h1>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm max-w-2xl">
            Browse sessions from events you&apos;re following and view reviews from all participants. Select a session
            to see everyone&apos;s reviews.
          </p>
          <FollowingEventsReviewsList />
        </div>
      </div>
    </SidebarTemplate>
  );
};

export default FollowingEventsReviewsPage;
