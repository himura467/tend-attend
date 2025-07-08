import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { NextPage } from "next";
import { Inter } from "next/font/google";
import React from "react";

const fontHeading = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const fontBody = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: NextPage<RootLayoutProps> = ({ children }): React.JSX.Element => {
  return (
    <html lang="en">
      <body className={cn("antialiased", fontHeading.variable, fontBody.variable)}>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
