import { SignUpForm } from "@/components/organisms/specific/signup/SignUpForm";
import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { Link } from "@/i18n/navigation";
import { rr } from "@/lib/utils/reverseRouter";
import { NextPage } from "next";
import { getTranslations } from "next-intl/server";
import React from "react";

interface SignUpPageProps {
  searchParams: Promise<{ followees?: string }>;
}

const SignUpPage: NextPage<SignUpPageProps> = async ({ searchParams }): Promise<React.JSX.Element> => {
  const query = await searchParams;
  const followees = query.followees;
  const t = await getTranslations("SignUpPage");

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
        <SignUpForm followees={followees} />
      </div>
    </DialogTemplate>
  );
};

export default SignUpPage;
