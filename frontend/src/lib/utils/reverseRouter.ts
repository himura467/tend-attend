import { LinkProps } from "@/i18n/navigation";

export const ReverseRouter = {
  index: (): LinkProps => ({ href: "/" }),
  logo: {
    index: (): LinkProps => ({ href: "/logo.svg" }),
  },
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
    event: {
      goals: {
        goal: {
          index: (eventId: string, start: string, guestId: string): LinkProps => ({
            href: `/events/${eventId}/${start}/goals/${guestId}`,
          }),
        },
        index: (eventId: string, start: string): LinkProps => ({
          href: `/events/${eventId}/${start}/goals`,
        }),
      },
      reviews: {
        review: {
          index: (eventId: string, start: string, guestId: string): LinkProps => ({
            href: `/events/${eventId}/${start}/reviews/${guestId}`,
          }),
        },
        index: (eventId: string, start: string): LinkProps => ({
          href: `/events/${eventId}/${start}/reviews`,
        }),
      },
    },
    attend: {
      index: (): LinkProps => ({ href: "/events/attend" }),
    },
    edit: {
      index: (): LinkProps => ({ href: "/events/edit" }),
    },
    goals: {
      index: (eventId?: string, start?: string): LinkProps => ({
        href: {
          pathname: "/events/goals",
          query: eventId && start ? { "event-id": eventId, start } : undefined,
        },
      }),
    },
    reviews: {
      index: (eventId?: string, start?: string): LinkProps => ({
        href: {
          pathname: "/events/reviews",
          query: eventId && start ? { "event-id": eventId, start } : undefined,
        },
      }),
    },
  },
  invite: {
    index: (from: string): LinkProps => ({
      href: {
        pathname: "/invite",
        query: { from },
      },
    }),
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
    index: (location?: string): LinkProps => ({
      href: {
        pathname: "/signin",
        query: location ? { location } : undefined,
      },
    }),
  },
  signup: {
    index: (followees?: string[]): LinkProps => ({
      href: {
        pathname: "/signup",
        query: followees && followees.length > 0 ? { followees: followees.join(",") } : undefined,
      },
    }),
  },
  subscriptions: {
    index: (): LinkProps => ({ href: "/subscriptions" }),
  },
  terms: {
    index: (): LinkProps => ({ href: "/terms" }),
  },
};

export const rr = ReverseRouter;
