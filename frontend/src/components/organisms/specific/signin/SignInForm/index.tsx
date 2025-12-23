"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import { createAuthSession } from "@/lib/api/auth";
import { routerPush } from "@/lib/utils/router";
import { Loader2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface SignInFormProps {
  location: string;
}

export const SignInForm = ({ location }: SignInFormProps): React.JSX.Element => {
  const router = useRouter();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await createAuthSession({
        username: username,
        password: password,
      });

      if (response.error_codes.length > 0) {
        toast.error("Failed to sign in");
        return;
      }

      routerPush({ href: location }, router);
    } catch {
      toast.error("Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          required
          pattern="[a-zA-Z0-9_]+"
          minLength={1}
          maxLength={32}
          title="Username must be 1-32 characters long and contain only letters, numbers, and underscores"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80">
        Forgot your password?
      </Link>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
};
