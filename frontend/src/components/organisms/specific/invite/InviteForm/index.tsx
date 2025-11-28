"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBaseUrl } from "@/hooks/useBaseUrl";
import { useClipboard } from "@/hooks/useClipboard";
import { useShare } from "@/hooks/useShare";
import { rr } from "@/lib/utils/reverseRouter";
import { Copy, Share2 } from "lucide-react";
import Image from "next/image";
import React from "react";

interface InviteFormProps {
  from: string;
}

export const InviteForm = ({ from }: InviteFormProps): React.JSX.Element => {
  const baseUrl = useBaseUrl();
  const { copy } = useClipboard();
  const { share, canShare } = useShare();

  const signupLinkProps = rr.signup.index([from]);
  const signupPathname =
    typeof signupLinkProps.href === "string" ? signupLinkProps.href : signupLinkProps.href.pathname;
  const signupQuery =
    typeof signupLinkProps.href === "object" && signupLinkProps.href.query
      ? `?${new URLSearchParams(signupLinkProps.href.query as Record<string, string>).toString()}`
      : "";
  const signupPath = `${signupPathname}${signupQuery}`;
  const signupUrl = `${baseUrl}${signupPath}`;
  const qrCodePath = `/qrcode${signupPath}`;
  const qrCodeUrl = `${baseUrl}${qrCodePath}`;

  const shareData = {
    text: `Follow ${from} on Tend Attend`,
    title: "Join Tend Attend",
    url: signupUrl,
  };

  const handleCopyUrl = async (): Promise<void> => {
    await copy(signupUrl, "Invite URL copied to clipboard");
  };

  const handleShare = async (): Promise<void> => {
    await share(shareData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Invite Users to Follow {from}</CardTitle>
        <CardDescription>Share this QR code to invite users to sign up and automatically follow you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-lg border border-border bg-white p-4">
            <Image
              src={qrCodeUrl}
              alt="Invite QR Code"
              width={400}
              height={400}
              className="h-auto w-full max-w-[400px]"
              unoptimized
            />
          </div>
          <p className="text-center text-sm text-muted-foreground">Scan this QR code to sign up and follow {from}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-url">Invite URL</Label>
          <div className="flex gap-2">
            <Input id="invite-url" type="text" value={signupUrl} readOnly />
            <Button variant="outline" size="icon" onClick={handleCopyUrl}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy URL</span>
            </Button>
            {canShare(shareData) && (
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
