import { rr } from "@/lib/utils/reverseRouter";
import Link from "next/link";
import React from "react";

export const Footer = (): React.JSX.Element => {
  return (
    <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
      <p className="text-muted-foreground text-xs">&copy; 2025 Akito Shitara. All rights reserved.</p>
      <nav className="flex gap-4 sm:ml-auto sm:gap-6">
        <Link {...rr.contact.index()} className="text-xs underline-offset-4 hover:underline">
          Contact Us
        </Link>
        <Link {...rr.privacy.index()} className="text-xs underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        <Link {...rr.terms.index()} className="text-xs underline-offset-4 hover:underline">
          Terms of Service
        </Link>
      </nav>
    </footer>
  );
};
