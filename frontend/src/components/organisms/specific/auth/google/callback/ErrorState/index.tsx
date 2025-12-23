import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { rr } from "@/lib/utils/reverseRouter";
import React from "react";

interface ErrorStateProps {
  errorMessage: string;
}

export const ErrorState = ({ errorMessage }: ErrorStateProps): React.JSX.Element => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Connection Failed</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
          </div>
          <Button asChild className="w-full">
            <Link {...rr.settings.integrations.index()}>Return to Integrations</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};
