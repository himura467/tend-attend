import { LinkProps } from "next/link";

export const ReverseRouter = {
  index: (): LinkProps => ({ href: "/" }),
  signup: {
    index: (): LinkProps => ({ href: "/signup" }),
  },
  signin: {
    index: (): LinkProps => ({ href: "/signin" }),
  },
  events: {
    attend: {
      index: (): LinkProps => ({ href: "/events/attend" }),
    },
    edit: {
      index: (): LinkProps => ({ href: "/events/edit" }),
    },
  },
};

export const rr = ReverseRouter;
