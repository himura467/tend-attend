import { routing } from "@/i18n/routing";
import createMiddleware from "next-intl/middleware";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for `/api`, `/_next`, `/_vercel` or the ones containing a dot
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
