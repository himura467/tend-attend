export const AttendanceAction = {
  ATTEND: "attend",
  LEAVE: "leave",
} as const;

export type AttendanceActionType = (typeof AttendanceAction)[keyof typeof AttendanceAction];

// Attendance Status defined by CEDS
// https://ceds.ed.gov/element/000076
export const AttendanceState = {
  PRESENT: 0,
  EXCUSED_ABSENCE: 1,
  UNEXCUSED_ABSENCE: 2,
  // TARDY: 3,
  // EARLY_DEPARTURE: 4,
} as const;

export type AttendanceStateType = (typeof AttendanceState)[keyof typeof AttendanceState];

export interface UserAttendance {
  userId: number;
  attendedAt: Date;
  leftAt: Date;
}

export interface Attendance {
  id: string;
  userName: string;
  userAttendances: UserAttendance[];
}
