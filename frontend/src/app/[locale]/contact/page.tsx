import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { NextPage } from "next";
import React from "react";

const ContactUsPage: NextPage = (): React.JSX.Element => {
  return (
    <DialogTemplate>
      <div className="w-full max-w-[800px] space-y-8">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h1>
        </div>
        <div className="text-foreground space-y-6">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Get in Touch</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions, support, or feedback, please contact us at{" "}
              <a href="mailto:mitarashidango0927@gmail.com" className="text-primary font-medium hover:underline">
                mitarashidango0927@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </DialogTemplate>
  );
};

export default ContactUsPage;
