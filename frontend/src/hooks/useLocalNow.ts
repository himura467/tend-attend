import { applyTimezone } from "@/lib/utils/timezone";
import { TZDate } from "@/lib/utils/tzdate";
import { useTimezone } from "./useTimezone";

export const useLocalNow = (): TZDate => {
  const timezone = useTimezone();
  return applyTimezone(new TZDate(), timezone);
};
