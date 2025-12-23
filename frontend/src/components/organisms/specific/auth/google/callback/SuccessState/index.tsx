import { Card } from "@/components/ui/card";
import React from "react";

interface SuccessStateProps {
  calendarUrl: string;
}

export const SuccessState = ({ calendarUrl }: SuccessStateProps): React.JSX.Element => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Successfully Connected!</h2>
            <p className="text-muted-foreground">Your Google Calendar has been connected successfully.</p>
            {calendarUrl && (
              <p className="text-sm text-muted-foreground break-all">
                Calendar URL: <span className="font-mono text-xs">{calendarUrl}</span>
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Redirecting to integrations page...</p>
        </div>
      </Card>
    </div>
  );
};
