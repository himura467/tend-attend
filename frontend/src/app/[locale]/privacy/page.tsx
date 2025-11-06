import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { rr } from "@/lib/utils/reverseRouter";
import { NextPage } from "next";
import Link from "next/link";
import React from "react";

const PrivacyPolicyPage: NextPage = (): React.JSX.Element => {
  return (
    <DialogTemplate>
      <div className="w-full max-w-[800px] space-y-8">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: 2025/11/07</p>
        </div>
        <div className="text-foreground space-y-6">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy describes how we collect, use, and protect your information when you use the Tend
              Attend event attendance management system.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="text-muted-foreground ml-6 list-disc space-y-1">
              <li>Account information (email address, username, nickname)</li>
              <li>Event attendance records</li>
              <li>Calendar integration data (when you connect Google Calendar)</li>
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">We use the information we collect to:</p>
            <ul className="text-muted-foreground ml-6 list-disc space-y-1">
              <li>Provide and maintain our services</li>
              <li>Track event attendance</li>
              <li>
                Train and forecast through proprietary machine learning models using your event attendance data to
                improve our services and provide personalized features
              </li>
              <li>Synchronize with your calendar applications</li>
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored securely using AWS cloud services. We implement appropriate technical and
              organizational measures to protect your personal information against unauthorized access, alteration, or
              destruction.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may integrate with third-party services such as Google Calendar. Your use of these services is subject
              to their respective privacy policies.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
            <ul className="text-muted-foreground ml-6 list-disc space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of certain data processing activities</li>
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or feedback about this Privacy Policy, please visit our{" "}
              <Link {...rr.contact.index()} className="text-primary font-medium hover:underline">
                Contact Us
              </Link>{" "}
              page.
            </p>
          </section>
        </div>
      </div>
    </DialogTemplate>
  );
};

export default PrivacyPolicyPage;
