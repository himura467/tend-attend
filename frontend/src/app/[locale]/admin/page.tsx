"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetAurora, stampRevision, upgradeDb } from "@/lib/api/admin";
import { BasicAuthCredentials } from "@/lib/api/dtos/auth";
import React from "react";
import { toast } from "sonner";

export default function AdminPage(): React.JSX.Element {
  const [credentials, setCredentials] = React.useState<BasicAuthCredentials>({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleResetAurora = async (): Promise<void> => {
    if (!credentials.username || !credentials.password) {
      toast.error("Please enter username and password");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetAurora(credentials);
      if (result.error_codes.length === 0) {
        toast.success("Aurora DB reset completed successfully");
      } else {
        toast.error(`Failed to reset Aurora DB`);
      }
    } catch {
      toast.error(`Failed to reset Aurora DB`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeDb = async (): Promise<void> => {
    if (!credentials.username || !credentials.password) {
      toast.error("Please enter username and password");
      return;
    }

    setIsLoading(true);

    try {
      const result = await upgradeDb(credentials);
      if (result.error_codes.length === 0) {
        toast.success("Database upgrade completed successfully");
      } else {
        toast.error(`Failed to upgrade database`);
      }
    } catch {
      toast.error(`Failed to upgrade database`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStampRevision = async (revision: string): Promise<void> => {
    if (!credentials.username || !credentials.password) {
      toast.error("Please enter username and password");
      return;
    }

    setIsLoading(true);

    try {
      const result = await stampRevision(credentials, { revision });
      if (result.error_codes.length === 0) {
        toast.success("Revision stamp completed successfully");
      } else {
        toast.error(`Failed to stamp revision`);
      }
    } catch {
      toast.error(`Failed to stamp revision`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="Admin username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Admin password"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Database Operations</h3>

            <Button onClick={handleResetAurora} disabled={isLoading} variant="destructive" className="w-full">
              {isLoading ? "Processing..." : "Reset Aurora DB"}
            </Button>

            <Button onClick={handleUpgradeDb} disabled={isLoading} className="w-full">
              {isLoading ? "Processing..." : "Upgrade Database"}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="revision">Stamp Revision</Label>
              <div className="flex gap-2">
                <Input id="revision" placeholder="Revision ID" className="flex-1" />
                <Button
                  onClick={() => {
                    const revisionInput = document.getElementById("revision") as HTMLInputElement;
                    const revision = revisionInput?.value;
                    if (revision) {
                      handleStampRevision(revision);
                    } else {
                      toast.error("Please enter a revision ID");
                    }
                  }}
                  disabled={isLoading}
                >
                  Stamp
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
