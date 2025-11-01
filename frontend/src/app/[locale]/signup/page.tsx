import { SignUpForm } from "@/components/organisms/specific/accounts/signup/SignUpForm";
import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { rr } from "@/lib/utils/reverseRouter";
import { NextPage } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

const SignUpPage: NextPage = (): React.JSX.Element => {
  const t = useTranslations("SignUpPage");
  return (
    <DialogTemplate>
      <div className="w-full max-w-[600px] space-y-6">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">
            Already have an account?{" "}
            <Link {...rr.signin.index()} className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        <SignUpForm />
      </div>
    </DialogTemplate>
  );
};

export default SignUpPage;
