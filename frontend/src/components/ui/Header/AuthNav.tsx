"use client";

import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { getAuthStatus, revokeAuthSession } from "@/lib/api/auth";
import { rr } from "@/lib/utils/reverseRouter";
import { routerPush } from "@/lib/utils/router";
import React from "react";
import { toast } from "sonner";

export const AuthNav = (): React.JSX.Element => {
  const router = useRouter();

  const [username, setUsername] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  React.useEffect(() => {
    const getAuth = async (): Promise<void> => {
      try {
        const response = await getAuthStatus();
        if (response.error_codes.length > 0) {
          setUsername(null);
        } else {
          setUsername(response.username);
        }
      } catch {
        setUsername(null);
      } finally {
        setIsLoading(false);
      }
    };

    void getAuth();
  }, []);

  const handleSignOut = async (): Promise<void> => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      const response = await revokeAuthSession();
      if (response.error_codes.length > 0) {
        toast.error("Failed to sign out");
        return;
      }
      setUsername(null);
      toast.success("Signed out successfully");
      routerPush(rr.index(), router);
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-muted h-9 w-20 animate-pulse rounded-md" />
        <div className="bg-muted h-9 w-20 animate-pulse rounded-md" />
      </div>
    );
  }

  if (username) {
    return (
      <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
        {isSigningOut ? "Signing out..." : "Sign Out"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild>
        <Link {...rr.signin.index()}>Sign In</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link {...rr.signup.index()}>Sign Up</Link>
      </Button>
    </div>
  );
};
