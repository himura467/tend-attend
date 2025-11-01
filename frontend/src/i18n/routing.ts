import { defaultLocale, locales } from "@/i18n/locale";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales,
  defaultLocale,
});
