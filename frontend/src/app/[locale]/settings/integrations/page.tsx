import { GoogleCalendarIntegration } from "@/components/organisms/specific/settings/integrations/GoogleCalendarIntegration";
import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { rr } from "@/lib/utils/reverseRouter";
import { NextPage } from "next";
import React from "react";

const IntegrationsPage: NextPage = (): React.JSX.Element => {
  return (
    <DialogTemplate>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Integrations</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link {...rr.subscriptions.index()}>Followee Calendars</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link {...rr.events.edit.index()}>Edit Events</Link>
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Google Calendar Integration</h2>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Connect your Google Calendar to automatically sync events and share a public calendar URL with your
              followers.
            </p>
          </div>
          <GoogleCalendarIntegration />
        </div>
      </div>
    </DialogTemplate>
  );
};

export default IntegrationsPage;
