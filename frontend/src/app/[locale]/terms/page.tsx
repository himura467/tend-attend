import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { rr } from "@/lib/utils/reverseRouter";
import { NextPage } from "next";
import Link from "next/link";
import React from "react";

const TermsOfServicePage: NextPage = (): React.JSX.Element => {
  return (
    <DialogTemplate>
      <div className="w-full max-w-[800px] space-y-8">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Last updated: 2025/11/07</p>
        </div>
        <div className="text-foreground space-y-6">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Tend Attend. By accessing or using our event attendance management service, you agree to be
              bound by these Terms of Service.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">What We Provide</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tend Attend provides an event attendance management system that enables you to:
            </p>
            <ul className="text-muted-foreground ml-6 list-disc space-y-1">
              <li>Create and manage events</li>
              <li>Track and record attendance for your events</li>
              <li>Integrate with Google Calendar</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We continuously work to improve and expand our services, which means features may be updated, modified, or
              discontinued based on user needs and technical requirements.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Your Account and Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">
              To use our service, you must create an account and provide accurate information. You are responsible for:
            </p>
            <ul className="text-muted-foreground ml-6 list-disc space-y-1">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access or security breach</li>
              <li>Ensuring your account information remains current and accurate</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You must be at least 12 years old to use Tend Attend. If you are under 18, you must have permission from a
              parent or legal guardian.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              When using Tend Attend, you agree to comply with all applicable laws and regulations. You must not:
            </p>
            <ul className="text-muted-foreground ml-6 list-disc space-y-1">
              <li>Use the service for any unlawful purposes or to promote illegal activities</li>
              <li>Violate any laws in your jurisdiction, including intellectual property laws</li>
              <li>Infringe upon or violate the rights of others, including privacy rights</li>
              <li>Transmit viruses, malware, or any other harmful or malicious code</li>
              <li>Interfere with, disrupt, or create an undue burden on the service or networks</li>
              <li>Attempt to gain unauthorized access to any part of the service or related systems</li>
              <li>Use automated systems to access the service in a manner that exceeds reasonable usage</li>
              <li>Impersonate any person or entity, or falsely represent your affiliation</li>
              <li>Collect or harvest information about other users without their consent</li>
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may stop using Tend Attend at any time and may request account deletion through our service interface
              or by contacting us.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account and access to the service immediately, without
              prior notice or liability, if you breach these Terms or engage in conduct that we determine, in our sole
              discretion, is inappropriate or harmful to us, other users, or third parties.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Upon termination, your right to use the service will immediately cease. We may retain certain information
              as required by law or for legitimate business purposes.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Machine Learning and Data Processing</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using our service, you acknowledge and agree that we may use your event attendance data to train and
              improve our proprietary machine learning models. This helps us:
            </p>
            <ul className="text-muted-foreground ml-6 list-disc space-y-1">
              <li>Provide personalized recommendations and insights</li>
              <li>Improve attendance forecasting and pattern recognition</li>
              <li>Enhance service quality and user experience</li>
              <li>Develop new features and capabilities</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              All data processing is conducted in accordance with our{" "}
              <Link {...rr.privacy.index()} className="text-primary font-medium hover:underline">
                Privacy Policy
              </Link>{" "}
              and applicable data protection laws.
            </p>
          </section>
          {/* <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Intellectual Property Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tend Attend and its original content, features, functionality, and visual design are owned by Tend Attend
              and are protected by international copyright, trademark, patent, trade secret, and other intellectual
              property laws. Our trademarks and trade dress may not be used without prior written consent.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You may not copy, modify, distribute, sell, or lease any part of our services, nor may you reverse
              engineer or attempt to extract the source code of our software, unless applicable laws prohibit these
              restrictions or you have our written permission.
            </p>
          </section> */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Third-Party Services and Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tend Attend integrates with third-party services, including Google Calendar. Your use of these third-party
              services is governed by their respective terms of service and privacy policies. We are not responsible for
              the availability, content, privacy practices, or terms of these external services.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Links to third-party websites or services are provided for your convenience. We do not endorse and are not
              responsible for the content or practices of any linked sites.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Service Modifications and Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any aspect of Tend Attend at any time, with or
              without notice. We may also impose limits on certain features or restrict access to parts or all of the
              service without liability.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              While we strive to maintain service availability, we cannot guarantee uninterrupted access. The service
              may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Warranties and Disclaimers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tend Attend is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of
              any kind, either express or implied. To the fullest extent permitted by law, we disclaim all warranties,
              including but not limited to:
            </p>
            <ul className="text-muted-foreground ml-6 list-disc space-y-1">
              <li>Implied warranties of merchantability and fitness for a particular purpose</li>
              <li>Non-infringement of third-party rights</li>
              <li>That the service will be uninterrupted, secure, or error-free</li>
              <li>That any defects will be corrected</li>
              <li>The accuracy, reliability, or completeness of any content or information</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We make no warranty that the service will meet your requirements or expectations. Your use of the service
              is at your sole risk.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by applicable law, Tend Attend, its directors, employees, partners,
              agents, suppliers, and affiliates shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of profits, revenue, data, use, goodwill, or other
              intangible losses, resulting from:
            </p>
            <ul className="text-muted-foreground ml-6 list-disc space-y-1">
              <li>Your access to, use of, or inability to access or use the service</li>
              <li>Any conduct or content of any third party on the service</li>
              <li>Unauthorized access, use, or alteration of your content or data</li>
              <li>Any interruption or cessation of the service</li>
            </ul>
            {/* <p className="text-muted-foreground leading-relaxed mt-3">
              In no event shall our total liability exceed the amount you paid to us in the twelve months prior to the
              event giving rise to the liability, or one hundred dollars ($100), whichever is greater.
            </p> */}
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless Tend Attend and its officers, directors, employees, and
              agents from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable
              attorneys&apos; fees) arising out of or relating to:
            </p>
            <ul className="text-muted-foreground ml-6 list-disc space-y-1">
              <li>Your use of or inability to use the service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your content or any content submitted through your account</li>
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms and any disputes arising from or relating to your use of Tend Attend shall be governed by and
              construed in accordance with the laws of Japan, without regard to its conflict of law provisions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You agree that any dispute, claim, or controversy arising out of or relating to these Terms or the service
              shall be resolved exclusively in the courts located in Japan, and you consent to the jurisdiction of such
              courts.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">General Provisions</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms constitute the entire agreement between you and Tend Attend regarding your use of the service
              and supersede any prior agreements. If any provision of these Terms is found to be unenforceable, the
              remaining provisions will continue in full effect.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our failure to enforce any right or provision of these Terms will not be deemed a waiver of such right or
              provision. You may not assign or transfer these Terms or your rights under them without our prior written
              consent. We may assign our rights and obligations under these Terms without restriction.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Changes to These Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. We will notify you of any changes by posting the new Terms of
              Service on this page.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or feedback about these Terms of Service, please visit our{" "}
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

export default TermsOfServicePage;
