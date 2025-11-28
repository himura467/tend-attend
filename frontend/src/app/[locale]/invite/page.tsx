"use client";

import { InviteForm } from "@/components/organisms/specific/invite/InviteForm";
import { SidebarTemplate } from "@/components/templates/SidebarTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NextPage } from "next";
import { useSearchParams } from "next/navigation";

const InvitePage: NextPage = (): React.JSX.Element => {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

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
