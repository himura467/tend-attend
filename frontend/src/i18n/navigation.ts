import { routing } from "@/i18n/routing";
import { createNavigation } from "next-intl/navigation";

export const { Link, getPathname, redirect, usePathname, useRouter } = createNavigation(routing);
