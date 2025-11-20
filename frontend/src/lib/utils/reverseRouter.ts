import { LinkProps } from "@/i18n/navigation";

export const ReverseRouter = {
  index: (): LinkProps => ({ href: "/" }),
  auth: {
    google: {
      callback: {
        index: (): LinkProps => ({ href: "/auth/google/callback" }),
      },
    },
  },
  contact: {
    index: (): LinkProps => ({ href: "/contact" }),
  },
  events: {
    attend: {
      index: (): LinkProps => ({ href: "/events/attend" }),
    },
    edit: {
      index: (): LinkProps => ({ href: "/events/edit" }),
    },
    goals: {
      index: (): LinkProps => ({ href: "/events/goals" }),
    },
    reviews: {
      index: (): LinkProps => ({ href: "/events/reviews" }),
    },
  },
  privacy: {
    index: (): LinkProps => ({ href: "/privacy" }),
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
  terms: {
    index: (): LinkProps => ({ href: "/terms" }),
  },
};

export const rr = ReverseRouter;
