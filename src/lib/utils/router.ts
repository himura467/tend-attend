import { formatUrl } from "@/lib/utils/url";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { LinkProps } from "next/link";

type Destination = Pick<LinkProps, "href">;

export const routerPush = (destination: Destination, router: AppRouterInstance): void => {
  router.push(formatUrl(destination.href));
};
