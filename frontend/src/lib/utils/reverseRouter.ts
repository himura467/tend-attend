import { LinkProps } from "next/link";

export const ReverseRouter = {
  index: (): LinkProps => ({ href: "/" }),
  auth: {
    google: {
      callback: {
        index: (): LinkProps => ({ href: "/auth/google/callback" }),
      },
    },
  },
  events: {
    attend: {
      index: (): LinkProps => ({ href: "/events/attend" }),
    },
    edit: {
      index: (): LinkProps => ({ href: "/events/edit" }),
    },
  },
  settings: {
    integrations: {
      index: (): LinkProps => ({ href: "/settings/integrations" }),
    },
  },
  signin: {
    index: (): LinkProps => ({ href: "/signin" }),
  },
  signup: {
    index: (): LinkProps => ({ href: "/signup" }),
  },
  subscriptions: {
    index: (): LinkProps => ({ href: "/subscriptions" }),
  },
};

export const rr = ReverseRouter;
