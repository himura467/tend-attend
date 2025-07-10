export const AttendanceAction = {
  ATTEND: "attend",
  LEAVE: "leave",
} as const;

export type AttendanceActionType = (typeof AttendanceAction)[keyof typeof AttendanceAction];

// Attendance Status defined by CEDS
// https://ceds.ed.gov/element/000076
export const AttendanceState = {
  // 出席
  PRESENT: 0,
  // 連絡済み欠席
  EXCUSED_ABSENCE: 1,
  // 未連絡欠席
  UNEXCUSED_ABSENCE: 2,
  // 遅刻
  // TARDY: 3,
  // 早退
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
