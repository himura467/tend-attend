import React from "react";

export default function RootLayout({ children }: LayoutProps<"/">): React.JSX.Element {
  return <>{children}</>;
}
