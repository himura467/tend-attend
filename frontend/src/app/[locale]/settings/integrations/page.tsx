import { GoogleCalendarIntegration } from "@/components/organisms/specific/settings/integrations/GoogleCalendarIntegration";
import { SidebarTemplate } from "@/components/templates/SidebarTemplate";
import { NextPage } from "next";
import React from "react";

const IntegrationsPage: NextPage = (): React.JSX.Element => {
  return (
    <SidebarTemplate>
      <div className="w-full space-y-6">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Integrations</h1>
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
    </SidebarTemplate>
  );
};

export default IntegrationsPage;
