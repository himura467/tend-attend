import { InviteForm } from "@/components/organisms/specific/invite/InviteForm";
import { SidebarTemplate } from "@/components/templates/SidebarTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NextPage } from "next";
import React from "react";

interface InvitePageProps {
  searchParams: Promise<{ from?: string }>;
}

const InvitePage: NextPage<InvitePageProps> = async ({ searchParams }): Promise<React.JSX.Element> => {
  const query = await searchParams;
  const from = query.from;

  if (!from) {
    return (
      <SidebarTemplate>
        <div className="w-full space-y-6">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Invite Users</h1>
          <Card>
            <CardHeader>
              <CardTitle>Missing Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Please provide from parameter.</p>
            </CardContent>
          </Card>
        </div>
      </SidebarTemplate>
    );
  }

  return (
    <SidebarTemplate>
      <div className="w-full space-y-6">
        <InviteForm from={from} />
      </div>
    </SidebarTemplate>
  );
};

export default InvitePage;
