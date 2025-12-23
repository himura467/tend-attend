import { GoogleCallbackContent } from "@/components/organisms/specific/auth/google/callback/GoogleCallbackContent";
import { LoadingState } from "@/components/organisms/specific/auth/google/callback/LoadingState";
import { NextPage } from "next";
import React from "react";

interface GoogleCallbackPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const GoogleCallbackPage: NextPage<GoogleCallbackPageProps> = async ({ searchParams }): Promise<React.JSX.Element> => {
  const params = await searchParams;

  return (
    <React.Suspense fallback={<LoadingState />}>
      <GoogleCallbackContent searchParams={params} />
    </React.Suspense>
  );
};

export default GoogleCallbackPage;
