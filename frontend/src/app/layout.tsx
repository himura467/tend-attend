import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">): React.JSX.Element {
  return <>{children}</>;
}
