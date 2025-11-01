import { Locale } from "next-intl";

export const locales = ["en", "ja"] as const satisfies readonly Locale[];
export const defaultLocale = "en" satisfies Locale;
