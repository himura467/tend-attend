import { SignInForm } from "@/components/organisms/specific/accounts/signin/SignInForm";
import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { Link } from "@/i18n/navigation";
import { rr } from "@/lib/utils/reverseRouter";
import { formatUrl } from "@/lib/utils/url";
import { NextPage } from "next";
import React from "react";

const SignInPage: NextPage = (): React.JSX.Element => {
  return (
    <DialogTemplate>
      <div className="w-full max-w-[600px] space-y-6">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Sign in to your account</h1>
          <p className="text-muted-foreground mt-2">
            Don&apos;t have an account?{" "}
            <Link {...rr.signup.index()} className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        <SignInForm location={formatUrl(rr.events.edit.index().href)} />
      </div>
    </DialogTemplate>
  );
};

export default SignInPage;
