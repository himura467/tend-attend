import { routing } from "@/i18n/routing";
import { createNavigation } from "next-intl/navigation";
import React from "react";

export const { Link, getPathname, redirect, usePathname, useRouter } = createNavigation(routing);
export type LinkProps = React.ComponentProps<typeof Link>;
