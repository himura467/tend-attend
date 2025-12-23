import { Card } from "@/components/ui/card";
import React from "react";

export const LoadingState = (): React.JSX.Element => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Connecting Google Calendar</h2>
            <p className="text-muted-foreground">Please wait while we complete the connection...</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
